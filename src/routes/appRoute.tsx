import type { JSX } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import TestFindPath from "../components/TestPath.tsx"
import ParkingMap from "../components/ParkingMap.tsx";

const MainHeader = (): JSX.Element => {
    return(
        <>
            <Outlet />
        </>
    )
}

const AppRoute = (): JSX.Element => {
    return(
        <Routes>
            <Route element={<MainHeader />}>
                <Route path="/" element={<Home />} />
            </Route>
            <Route path="/test-path" element={<TestFindPath />} />
            <Route path="/parking-map" element={<ParkingMap />} />
        </Routes>

    )
}

export default AppRoute;