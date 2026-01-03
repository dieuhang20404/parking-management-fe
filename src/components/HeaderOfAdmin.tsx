import { Col, Row } from "antd";
import { useEffect, useState, type JSX } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CarFront, History } from "lucide-react";
import "./HeaderOfAdmin.scss";

const HeaderOfAdmin = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [indexOfItem, setIndexOfItem] = useState<number>(0);
    const iconsItem = [CarFront, History]
    const nameItem = ["Trạng thái", "Lịch sử"]

    useEffect(() => {
        const path = location.pathname;
        if (path == "/admin/status") {
            setIndexOfItem(0);
        } else if (path == "/admin/history") {
            setIndexOfItem(1);
        }
    }, [])

    const navigateMenu = (index: number) => {
        if (index == 0) {
            navigate("/admin/status");
        } else if (index == 1) {
            navigate("/admin/history");
        }
    }

    return(
        <>
            <Row
                style={{
                    // backgroundColor: `${useScreens().sm ? "pink" : "yellow"}`, 
                    backgroundColor: "white",
                    padding: "15px 0px", 
                    boxShadow: "0 0 20px 2px rgba(0, 0, 0, 0.3)", 
                    position: "sticky",
                    top: "0px",
                    left: "0px",
                    width: "100%",
                    height: "60px",
                    zIndex: 100
                }}
            >
                <Col span={24} style={{backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <div style={{fontSize: "25px", fontFamily: "Playfair Display"}}>PARKING</div>
                </Col>
            </Row>
            <Row className="menu-outlet-container" align="top">
                <Col span={5} style={{display: "flex", justifyContent: "center", alignItems: "center", height: "fit-content", position: "sticky", paddingTop: "10px", top: "60px"}}>
                    <div className="menu-static">
                        <div className="feature-menu">
                            {
                                iconsItem.map((Item, index) => (
                                    <div 
                                        key={index}
                                        className={`admin-menu-item ${indexOfItem == index ? "admin-menu-item-active" : ""}`}
                                        onClick={() => {
                                            setIndexOfItem(index);
                                            navigateMenu(index);
                                        }}
                                    >
                                        <Item size={22} strokeWidth={1} />
                                        <div className="admin-menu-item-name">{nameItem[index]}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </Col>
                <Col span={19} style={{display: "flex", justifyContent: "end", alignItems: "center", padding: "10px 0px"}}>
                    <div className="outlet page-container">{<Outlet />}</div>
                </Col>
            </Row>
        </>
    )
}

export default HeaderOfAdmin;