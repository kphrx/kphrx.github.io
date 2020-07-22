import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class CollapseAnimation extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly expanded!: boolean

  addHeight(el: HTMLElement): void {
    el.style.height = el.scrollHeight + 'px'
  }

  removeHeight(el: HTMLElement): void {
    el.style.height = 'auto'
  }
}
