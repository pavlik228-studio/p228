import Stats from 'stats.js'

export class RenderingStats {
  private readonly _stats: Stats
  constructor() {
    this._stats = new Stats()
    this._stats.showPanel(0)
    document.body.appendChild(this._stats.dom)
  }

  public begin(): void {
    this._stats.begin()
  }

  public end(): void {
    this._stats.end()
  }
}