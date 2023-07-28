class Chart {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D | null

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
    }
}
