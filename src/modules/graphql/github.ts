import { GraphQLClient } from 'graphql-request'

interface Cursors {
  orgs?: string;
  repos?: string;
  gists?: string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

interface Language {
  name: string;
  color: string;
}

interface NodeInfo {
  isFork: boolean;
  pushedAt: string;
  updatedAt: string;
}

export interface Gist extends NodeInfo {
  files: {
    name: string;
    text: string;
    language: Language;
  }[];
  url: string;
  description: string;
  stargazers: { totalCount?: number };
  forks: { totalCount?: number };
}

export interface Repository extends NodeInfo {
  nameWithOwner: string;
  url: string;
}

export interface OrganizationRepository extends Repository {
  description: string;
  stargazers: { totalCount?: number };
  forkCount: number;
  parent: Repository;
  primaryLanguage: Language;
}

export interface UserRepository extends Repository {
  name: string;
  owner: Owner;
  description: string;
  stargazers: { totalCount?: number };
  forkCount: number;
  parent: Repository;
  primaryLanguage: Language;
}

interface Owner {
  login: string;
}

interface Organization extends Owner {
  repositories: RepositoryConnection<OrganizationRepository>;
}

interface User extends Owner {
  repositories: RepositoryConnection<UserRepository>;
  organizations: OrganizationConnection;
  gists: GistConnection;
}

interface OrganizationConnection {
  totalCount?: number;
  pageInfo: PageInfo;
  nodes: Organization[];
}

interface RepositoryConnection<T extends Repository> {
  totalCount?: number;
  pageInfo: PageInfo;
  nodes: T[];
}

interface GistConnection {
  totalCount?: number;
  pageInfo: PageInfo;
  nodes: Gist[];
}

export default class GitHubGraphQL {
  private client: GraphQLClient

  language = `fragment language on Language {
    name
    color
  }`

  pageInfo = `fragment pageInfo on PageInfo {
    hasNextPage
    endCursor
  }`

  gists = `fragment gists on GistConnection {
    pageInfo {
      ...pageInfo
    }
    nodes {
      files {
        name
        text
        language {
          ...language
        }
      }
      url
      description
      stargazers {
        totalCount
      }
      forks {
        totalCount
      }
      isFork
      pushedAt
      updatedAt
    }
  }`

  userRepositories = `fragment userRepositories on RepositoryConnection {
    pageInfo {
      ...pageInfo
    }
    nodes {
      name
      nameWithOwner
      owner { login }
      url
      description
      stargazers { totalCount }
      forkCount
      isFork
      parent {
        nameWithOwner
        url
      }
      primaryLanguage {
        ...language
      }
      pushedAt
      updatedAt
    }
  }`

  organizations = `fragment organizations on OrganizationConnection {
    pageInfo {
      ...pageInfo
    }
    nodes {
      login
      repositories(first: 100) {
        totalCount
        ...organizationRepositories
      }
    }
  }`

  organizationRepositories = `fragment organizationRepositories on RepositoryConnection {
    pageInfo {
      ...pageInfo
    }
    nodes {
      nameWithOwner
      url
      description
      stargazers {
        totalCount
      }
      forkCount
      isFork
      parent {
        nameWithOwner
        url
      }
      primaryLanguage {
        ...language
      }
      pushedAt
      updatedAt
    }
  }`

  constructor(token: string) {
    this.client = new GraphQLClient("https://api.github.com/graphql", {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  async fetchAll() {
    const data: { viewer: User } = await this.client.request(`query {
      viewer {
        organizations(first: 100) {
          totalCount
          ...organizations
        }
        repositories(first: 100) {
          totalCount
          ...userRepositories
        }
        gists(first: 100) {
          totalCount
          ...gists
        }
      }
    } ${[this.pageInfo, this.language, this.organizationRepositories, this.organizations, this.userRepositories, this.gists].join('')}`.replace(/\s+/g, ' ').replace(/ ?({|}|:) ?/g, '$1'))

    const nextOrgs = data.viewer.organizations.nodes.filter(org => org.repositories.pageInfo.hasNextPage).map(org => ({ name: org.login, cursor: org.repositories.pageInfo.endCursor }))
    const nextCursor: Cursors = {}
    if (data.viewer.organizations?.pageInfo.hasNextPage) {
      nextCursor.orgs = data.viewer.organizations.pageInfo.endCursor
    }
    if (data.viewer.repositories?.pageInfo.hasNextPage) {
      nextCursor.repos = data.viewer.repositories.pageInfo.endCursor
    }
    if (data.viewer.gists?.pageInfo.hasNextPage) {
      nextCursor.gists = data.viewer.gists.pageInfo.endCursor
    }
    const next = await this.fetchRecursiveAll(nextOrgs, nextCursor)

    data.viewer.organizations?.nodes.push(...next.organizations?.nodes || [])
    data.viewer.repositories?.nodes.push(...next.repositories?.nodes || [])
    data.viewer.gists?.nodes.push(...next.gists?.nodes || [])

    return data.viewer
  }

  private async fetchRecursiveAll(orgs: { name: string; cursor: string }[], cursor: Cursors) {
    const orgQueries = orgs.map(org => {
      return `${org.name}: organization(login: "${org.name}") {
        repositories(first: 100, after: "${org.cursor}") {
          ...organizationRepositories
        }
      }`
    }).join('')
    const orgsQuery = cursor.orgs == null ? '' : `organizations(first: 100, after: "${cursor.orgs}") {
      ...organizations
    }`
    const reposQuery = cursor.repos == null ? '' : `repositories(first: 100, after: "${cursor.repos}") {
      ...userRepositories
    }`
    const gistsQuery = cursor.gists == null ? '' : `gists(first: 100, after: "${cursor.gists}") {
      ...gists
    }`

    if (!orgQueries && !orgsQuery && !reposQuery && !gistsQuery) return {}

    const data: { viewer: Partial<User> & { [key: string]: RepositoryConnection<OrganizationRepository> } } = await this.client.request(`query {
      viewer {
        ${orgQueries}
        ${orgsQuery}
        ${reposQuery}
        ${gistsQuery}
      }
    } ${[
      this.pageInfo,
      this.language,
      orgsQuery || orgQueries ? this.organizationRepositories : '',
      orgsQuery ? this.organizations : '',
      reposQuery ? this.userRepositories : '',
      gistsQuery ? this.gists : '',
    ].join('')}`.replace(/\s+/g, ' ').replace(/ ?({|}|:) ?/g, '$1'))

    const nextOrgs = [
      ...data.viewer.organizations?.nodes.filter(org => org.repositories.pageInfo.hasNextPage).map(org => ({ name: org.login, cursor: org.repositories.pageInfo.endCursor })) || [],
      ...orgs.map(org => org.name).filter(name => data.viewer[name].pageInfo.hasNextPage).map(name => ({ name, cursor: data.viewer[name].pageInfo.endCursor }))
    ]
    const nextCursor: Cursors = {}
    if (data.viewer.organizations?.pageInfo.hasNextPage) {
      nextCursor.orgs = data.viewer.organizations.pageInfo.endCursor
    }
    if (data.viewer.repositories?.pageInfo.hasNextPage) {
      nextCursor.repos = data.viewer.repositories.pageInfo.endCursor
    }
    if (data.viewer.gists?.pageInfo.hasNextPage) {
      nextCursor.gists = data.viewer.gists.pageInfo.endCursor
    }
    const next = await this.fetchRecursiveAll(nextOrgs, nextCursor)

    data.viewer.organizations?.nodes.push(...next.organizations?.nodes || [])
    data.viewer.repositories?.nodes.push(...next.repositories?.nodes || [])
    data.viewer.gists?.nodes.push(...next.gists?.nodes || [])

    return data.viewer
  }
}
