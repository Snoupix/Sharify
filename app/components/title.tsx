import { Link, useLocation } from "@remix-run/react"

export default function Title() {
    const location = useLocation()

    const defaultStyle = "z-10 font-kaushan text-shadow font-bold text-2xl md:text-3xl xl:text-5xl"
    const topLeftStyle = "z-10 font-kaushan text-shadow font-bold text-2xl md:text-3xl xl:text-5xl absolute top-0 left-0 p-8"

    return <Link className={location.pathname == "/" ? defaultStyle : topLeftStyle} to="/">Sharify</Link>
}
