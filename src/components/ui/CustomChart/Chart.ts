import { DataPoint } from './Chart.d'

class Chart {
    private readonly colors = {
        backgroundColor: '#171A1E',
        gridColor: '#384659',
        positiveColor: '#5DC887',
        negativeColor: '#E35561',
    }
    private readonly scaleResolution: number = 2
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private dataValues: DataPoint[] | null = null
    private zoom: number = 1

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas as HTMLCanvasElement
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        this.setBackgroundColor(this.colors.backgroundColor)
        this.resizeCanvas()
        window.addEventListener('resize', this.resizeCanvas.bind(this))
    }

    public render(data: DataPoint[], zoom: number) {
        this.dataValues = data
        this.zoom = zoom
        this.draw()
    }

    private draw() {
        if (!this.dataValues) return

        this.clearCanvas()
        this.drawGrid()
        this.ctx.strokeStyle = this.colors.negativeColor
        this.ctx.lineWidth = 5
        this.ctx.beginPath()
        this.ctx.moveTo(0, 200 - this.dataValues[0].value * this.zoom)
        this.dataValues.forEach((dataPoint, index) => {
            this.ctx.lineTo((index * 50 + 50) * this.zoom, 200 - dataPoint.value * this.zoom)
        })
        this.ctx.stroke()
    }

    public setCanvasResolution(width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
    }

    private drawGrid() {
        const gridLinesCount = 11
        const horizontalSpacing = this.canvas!.height / (gridLinesCount - 1)

        const verticalSpacing = this.canvas!.width / 9

        this.ctx.beginPath()
        for (let i = 0; i < gridLinesCount; i++) {
            const y = horizontalSpacing * i
            this.ctx.moveTo(0, y)
            this.ctx.lineTo(this.canvas!.width, y)
        }
        this.ctx.strokeStyle = this.colors.gridColor
        this.ctx.stroke()

        this.ctx.beginPath()
        for (let i = 1; i < 9; i++) {
            const x = verticalSpacing * i
            this.ctx.moveTo(x, 0)
            this.ctx.lineTo(x, this.canvas!.height)
        }
        this.ctx.strokeStyle = this.colors.gridColor
        this.ctx.stroke()
    }

    public setBackgroundColor(color: string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    private resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return
        this.canvas.width = this.canvas.parentElement.clientWidth * this.scaleResolution
        this.canvas.height = this.canvas.parentElement.clientHeight * this.scaleResolution
        this.draw()
    }
}

export default Chart
