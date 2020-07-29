
interface String {
  minifyCSS(): string;
}

String.prototype.minifyCSS = function() {
  return this.replace(/\s+/g, ' ').replace(/: /g, ':').replace(/ (!important)/g, '$1').replace(/; /g, ';').replace(/ { /g, '{').replace(/;} ?/g, '}')
}
