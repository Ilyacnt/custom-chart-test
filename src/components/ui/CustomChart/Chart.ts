import { DataPoint } from './Chart.d'

class Chart {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    }

    public draw(data: DataPoint[], zoom: number) {
        this.clearCanvas()

        this.ctx.beginPath()
        this.ctx.moveTo(0, 200 - data[0].value * zoom)
        data.forEach((dataPoint, index) => {
            this.ctx.lineTo((index * 50 + 50) * zoom, 200 - dataPoint.value * zoom)
        })
        this.ctx.stroke()
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
    }
}

export default Chart
