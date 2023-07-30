import { DataPoint } from './Chart.d'

class Chart {
    private readonly colors = {
        backgroundColor: '#171A1E',
        gridColor: '#384659',
        cursorGridColor: '#AEB6B7',
        positiveColor: '#5DC887',
        negativeColor: '#E35561',
    }
    private dataValues: DataPoint[] | null = null

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    private cursorX: number = 0
    private cursorY: number = 0

    private readonly scaleResolution: number = 2

    private readonly maxZoom = 3
    private readonly minZoom = 0.5
    private zoomHorizontal: number = 1
    private zoomVertical: number = 1
    private readonly zoomFactor = 0.03

    private isDragging: boolean = false
    private dragStartX: number = 0
    private dragStartY: number = 0

    private isPinching: boolean = false
    private lastTouchX1: number = 0
    private lastTouchY1: number = 0
    private lastTouchX2: number = 0
    private lastTouchY2: number = 0

    private offsetX: number = 0
    private offsetY: number = 0
    private maxOffsetX: number = 0
    private maxOffsetY: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas as HTMLCanvasElement
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        this.setBackgroundColor(this.colors.backgroundColor)
        this.resizeCanvas()
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this))
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this))
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))
        window.addEventListener('resize', this.resizeCanvas.bind(this))
        canvas.addEventListener('wheel', this.handleMouseWheel.bind(this))
    }

    public render(data: DataPoint[]) {
        this.dataValues = data
        this.draw()
    }

    private draw() {
        this.clearCanvas()
        this.drawGrid()
        this.drawCursorLines()
        this.drawData()
    }

    private drawData() {
        if (!this.dataValues) return
        this.ctx.strokeStyle = this.colors.negativeColor
        this.ctx.lineWidth = 5
        this.ctx.beginPath()
        this.ctx.moveTo(
            0 + this.offsetX * this.zoomHorizontal,
            (200 - this.dataValues[0].value + this.offsetY) * this.zoomVertical
        )
        this.dataValues.forEach((dataPoint, index) => {
            this.ctx.lineTo(
                (index * 50 + 50 + this.offsetX) * this.zoomHorizontal,
                (200 - dataPoint.value + this.offsetY) * this.zoomVertical
            )
        })
        this.ctx.stroke()

        this.drawDataLabels()
    }

    private drawDataLabels() {
        if (!this.dataValues) return
        this.ctx.font = '20px "Rubik", sans-serif'
        this.ctx.fillStyle = this.colors.cursorGridColor

        const labelHeight = this.canvas.height - 30
        const labelWidth = this.canvas.width / this.dataValues.length

        this.dataValues.forEach((dataPoint, index) => {
            const x = index * labelWidth + labelWidth / 2
            const y = labelHeight
            const valueText = dataPoint.value.toFixed(2).toString()

            this.ctx.fillText(valueText, x, y)
        })
    }

    private drawGrid() {
        const { horizontalSpacing, verticalSpacing } = this.calculateGridSpacing()

        this.ctx.beginPath()
        for (let y = 0; y < this.canvas!.height; y += horizontalSpacing) {
            this.ctx.moveTo(0, (y + this.offsetY) * this.zoomVertical)
            this.ctx.lineTo(this.canvas!.width, (y + this.offsetY) * this.zoomVertical)
        }
        this.ctx.strokeStyle = this.colors.gridColor
        this.ctx.lineWidth = 1
        this.ctx.stroke()

        this.ctx.beginPath()
        for (let x = 0; x < this.canvas!.width; x += verticalSpacing) {
            this.ctx.moveTo((x + this.offsetX) * this.zoomHorizontal, 0)
            this.ctx.lineTo((x + this.offsetX) * this.zoomHorizontal, this.canvas!.height)
        }
        this.ctx.strokeStyle = this.colors.gridColor
        this.ctx.stroke()
    }

    private drawCursorLines() {
        this.ctx.setLineDash([10, 15])
        this.ctx.strokeStyle = this.colors.cursorGridColor
        this.ctx.lineWidth = 1

        this.ctx.beginPath()
        this.ctx.moveTo(0, this.cursorY)
        this.ctx.lineTo(this.canvas.width, this.cursorY)
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.moveTo(this.cursorX, 0)
        this.ctx.lineTo(this.cursorX, this.canvas.height)
        this.ctx.stroke()

        this.ctx.setLineDash([])
        this.drawCursorCoordinates()
    }

    private drawCursorCoordinates() {
        this.ctx.font = '20px "Rubik", sans-serif'

        const cursorTextX = `X: ${this.cursorX.toFixed(2)}`
        const cursorTextY = `Y: ${this.cursorY.toFixed(2)}`
        const textOffsetX = 20
        const textOffsetY = -45

        this.ctx.fillStyle = this.colors.cursorGridColor
        this.ctx.fillText(cursorTextX, this.cursorX + textOffsetX, this.cursorY + textOffsetY)
        this.ctx.fillText(cursorTextY, this.cursorX + textOffsetX, this.cursorY + textOffsetY + 25)
    }

    private calculateGridSpacing() {
        const maxHorizontalLines = 11
        const maxVerticalLines = 8
        const horizontalLines = Math.ceil(maxHorizontalLines / this.zoomVertical)
        const verticalLines = Math.ceil(maxVerticalLines / this.zoomHorizontal)

        let horizontalSpacing = this.canvas!.height / (horizontalLines - 1)
        let verticalSpacing = this.canvas!.width / (verticalLines - 1)

        if (this.zoomHorizontal > this.maxZoom) {
            this.zoomHorizontal = this.maxZoom
        }
        if (this.zoomVertical > this.maxZoom) {
            this.zoomVertical = this.maxZoom
        }
        if (this.zoomHorizontal < this.minZoom) {
            this.zoomHorizontal = this.minZoom
        }
        if (this.zoomVertical < this.minZoom) {
            this.zoomVertical = this.minZoom
        }

        const smoothnessFactor = 0.1
        horizontalSpacing = this.lerp(
            horizontalSpacing,
            this.canvas!.height / (maxHorizontalLines - 1),
            smoothnessFactor
        )
        verticalSpacing = this.lerp(
            verticalSpacing,
            this.canvas!.width / (maxVerticalLines - 1),
            smoothnessFactor
        )

        return {
            horizontalSpacing,
            verticalSpacing,
        }
    }

    private handleMouseDown(event: MouseEvent) {
        this.isDragging = true
        this.dragStartX = event.clientX
        this.dragStartY = event.clientY
    }

    private handleMouseUp() {
        this.isDragging = false
    }

    private handleMouseMove(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect()
        this.cursorX = (event.clientX - rect.left) * this.scaleResolution
        this.cursorY = (event.clientY - rect.top) * this.scaleResolution

        if (this.isDragging) {
            const deltaX = event.clientX - this.dragStartX
            const deltaY = event.clientY - this.dragStartY
            this.dragStartX = event.clientX
            this.dragStartY = event.clientY

            this.offsetX += deltaX
            this.offsetY += deltaY

            this.draw()
        } else {
            this.draw()
        }
    }

    private handleMouseWheel(event: WheelEvent) {
        event.preventDefault()
        const deltaX = event.deltaX
        const deltaY = event.deltaY

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const zoomDelta = deltaX > 0 ? 1 + this.zoomFactor : 1 - this.zoomFactor

            this.zoomHorizontalHandler(this.zoomHorizontal * zoomDelta)
        } else {
            const zoomDelta = deltaY > 0 ? 1 + this.zoomFactor : 1 - this.zoomFactor
            this.zoomVerticalHandler(this.zoomVertical * zoomDelta)
        }
        this.draw()
    }

    private handleTouchStart(event: TouchEvent) {
        if (event.touches.length === 2) {
            this.lastTouchX1 = event.touches[0].clientX
            this.lastTouchY1 = event.touches[0].clientY
            this.lastTouchX2 = event.touches[1].clientX
            this.lastTouchY2 = event.touches[1].clientY
            this.isPinching = true
        }
    }

    private handleTouchMove(event: TouchEvent) {
        if (this.isPinching && event.touches.length === 2) {
            const touchX1 = event.touches[0].clientX
            const touchY1 = event.touches[0].clientY
            const touchX2 = event.touches[1].clientX
            const touchY2 = event.touches[1].clientY

            const deltaX =
                Math.abs(touchX1 - touchX2) - Math.abs(this.lastTouchX1 - this.lastTouchX2)
            const deltaY =
                Math.abs(touchY1 - touchY2) - Math.abs(this.lastTouchY1 - this.lastTouchY2)

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                const zoomDelta = deltaX > 0 ? 1 + this.zoomFactor : 1 - this.zoomFactor
                this.zoomHorizontalHandler(this.zoomHorizontal * zoomDelta)
            } else {
                const zoomDelta = deltaY > 0 ? 1 + this.zoomFactor : 1 - this.zoomFactor
                this.zoomVerticalHandler(this.zoomVertical * zoomDelta)
            }

            this.lastTouchX1 = touchX1
            this.lastTouchY1 = touchY1
            this.lastTouchX2 = touchX2
            this.lastTouchY2 = touchY2

            this.draw()
        }
    }

    private handleTouchEnd(event: TouchEvent) {
        if (event.touches.length < 2) {
            this.isPinching = false
        }
    }

    public zoomHorizontalHandler(zoomLevel: number) {
        this.zoomHorizontal = Math.max(0.1, Math.min(10, zoomLevel))
        this.draw()
    }

    public zoomVerticalHandler(zoomLevel: number) {
        this.zoomVertical = Math.max(0.1, Math.min(10, zoomLevel))
        this.draw()
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    private setBackgroundColor(color: string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    private resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return

        const parentWidth = this.canvas.parentElement.clientWidth
        const parentHeight = this.canvas.parentElement.clientHeight

        this.canvas.width = parentWidth * this.scaleResolution
        this.canvas.height = parentHeight * this.scaleResolution

        this.zoomHorizontal = this.canvas.width / parentWidth
        this.zoomVertical = this.canvas.height / parentHeight

        this.draw()
    }

    private lerp(start: number, end: number, amount: number) {
        return (1 - amount) * start + amount * end
    }
}

export default Chart
