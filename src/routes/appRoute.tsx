import type { JSX } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Home from "../components/Home";

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
        </Routes>
    )
}

export default AppRoute;