import type { JSX } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import NotFound from "../components/NotFound";
import HeaderOfCustomer from "../components/HeaderOfCustomer";
import HeaderOfAdmin from "../components/HeaderOfAdmin";
import ParkingStatus from "../components/ParkingStatus";
import ParkingHistory from "../components/ParkingHistory";
import ConfirmAdmin from "../components/ConfirmAdmin";
import ParkingSupervised from "../components/ParkingSupervised";

const CustomerHeader = (): JSX.Element => {
    return(
        <>
            <div style={{backgroundColor: "white", height: "100vh", minHeight: "fit-content"}}>
                <HeaderOfCustomer />
                <div style={{padding: "10px 0px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

const AdminHeader = (): JSX.Element => {
    return(
        <>
            <HeaderOfAdmin />
        </>
    )
}

const AppRoute = (): JSX.Element => {
    return(
        <Routes>
            <Route
                path="/admin"
                element={
                    <AdminHeader />
                }
            >
                <Route index element={<ConfirmAdmin />} />
                <Route path="supervised" element={<ParkingSupervised />} />
                <Route path="history"element={<ParkingHistory />} />
                <Route path="status" element={<ParkingStatus />} />
                
            </Route>
            <Route element={<CustomerHeader />}>
                <Route path="/" element={<Home />} />
            </Route>
            <Route path="*" element={<NotFound />} />

        </Routes>
    )
}

export default AppRoute;