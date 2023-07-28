import CustomChart from '../ui/CustomChart/CustomChart'
import Header from '../ui/Header/Header'
import styles from './Layout.module.css'

const Layout = () => {
    return (
        <div className={styles.Layout}>
            <Header />
            <CustomChart />
        </div>
    )
}

export default Layout
