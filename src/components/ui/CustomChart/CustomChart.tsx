import { useEffect, useRef, useState } from 'react'
import styles from './CustomChart.module.css'
import Chart from './Chart'
import { chartMockData } from './chartMockData'

const CustomChart = () => {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [zoom, setZoom] = useState<number>(1)

    const drawCanvas = () => {
        if (!canvasRef.current) return
        const chart = new Chart(canvasRef.current)
        chart.render(chartMockData, zoom)
    }

    useEffect(() => {
        drawCanvas()
    }, [])

    return (
        <div className={styles.CustomChartContainer} ref={canvasContainerRef}>
            <canvas className={styles.CustomChart} ref={canvasRef} />
        </div>
    )
}

export default CustomChart
