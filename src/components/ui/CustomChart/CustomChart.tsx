import { useEffect, useRef, useState } from 'react'
import { DataPoint } from './Chart.d'
import styles from './CustomChart.module.css'
import Chart from './Chart'

const chartData: DataPoint[] = [
    {
        timestamp: Date.now(),
        value: 1337,
    },
]

const CustomChart = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [zoom, setZoom] = useState<number>(1)

    const drawCanvas = (): void => {
        if (!canvasRef.current) return
        const chart = new Chart(canvasRef.current)

        chart.draw(chartData, zoom)
    }

    useEffect(() => {
        drawCanvas()
    }, [])

    return <canvas className={styles.CustomChart} ref={canvasRef} />
}

export default CustomChart
