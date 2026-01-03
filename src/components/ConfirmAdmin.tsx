import { Col, Input, Modal, Row } from "antd";
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { messageService } from "../configs/interface";
import { checkOtpApi, sendOtpApi } from "../services/appService";
import Loading from "./Loading";

const ConfirmAdmin = (): JSX.Element => {
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(true);
    const [valueConfirm, setValueConfirm] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(-1);
    const [expiry, setExpiry] = useState<number>(0);

    useEffect(() => {
        sendOtp()
    }, [])

    useEffect(() => {
        if (expiry == 0) {
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = expiry - now;
            setTimeLeft(diff > 0 ? diff : 0) 
            if (diff > 0) {
                setTimeLeft(diff);
            } else {
                setTimeLeft(0);
                setExpiry(0);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiry])

    const sendOtp = async () => {
        setPageLoading(true);
        const admin = localStorage.getItem("admin")
        if (!admin) {
            try {
                const result = await sendOtpApi();
                if (result.code == 0) {
                    setExpiry(result.data);
                    messageService.success(result.message)
                } else if (result.code == 2) {
                    messageService.success(result.message);
                    setExpiry(result.data);
                } else {
                    messageService.error(result.message);
                    setOpen(false);
                    navigate("/");
                }
            } catch(e) {
                setOpen(false);
                console.log(e);
                messageService.error("Xảy ra lỗi ở server");
                navigate("/");
            } finally {
                setPageLoading(false);
            }
        } else {
            setPageLoading(false);
            setOpen(false);
            navigate("/admin/status")
        }
        
    }

    const formatTimeLeft = (): string => {
        const totelSecond = Math.max(0, Math.floor(timeLeft / 1000));
        const minutes = Math.floor(totelSecond / 60);
        const seconds = totelSecond % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }

    const handleOk = async () => {
        try {
            const result = await checkOtpApi(valueConfirm);
            if (result.code == 0) {
                localStorage.setItem("admin", result.data);
                setOpen(false);
                navigate("/admin/status");
            } else {
                setOpen(false);
                navigate("/");
                messageService.error(result.message)
            }
        } catch(e) {
            setOpen(false);
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
            navigate("/");
        }
    }

    const handleCancel = () => {
        setOpen(false);
        navigate("/");
    }
    return pageLoading ? <Loading /> : (
        <>
            <Modal
                title={<span style={{fontFamily: "Quicksand", fontSize: "18px"}}>Xác nhận admin</span>}
                open={open}
                centered={true}
                maskClosable={false}
                onOk={() => {handleOk()}}
                onCancel={() => {handleCancel()}}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{size: "large"}}
                cancelButtonProps={{size: "large"}}
            >
                <Row className="py-1" gutter={[0, 10]}>
                    <Col span={24} style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
                        <div>Nhập mã xác thực được gửi đến email của admin</div>
                    </Col>
                    <Col span={24} style={{display: "flex", justifyContent: "center"}}>
                        <Input 
                            style={{fontFamily: "Quicksand", height: "34.74px", width: "25%"}}
                            value={valueConfirm}
                            onChange={(event) => {
                                setValueConfirm(event.target.value);
                            }}
                        />
                    </Col>
                    {
                        expiry > 0 ? (
                            <Col span={24} style={{display: "flex", justifyContent: "center"}}>
                                <div>Mã xác thực hết hạn sau <span style={{cursor: "default", color: "var(--color6)"}}>{formatTimeLeft()}</span></div>
                            </Col>
                        ) : (
                            <Col span={24} style={{display: "flex", justifyContent: "center"}}>
                                <div>
                                    Không nhận được mã? <span 
                                        style={{cursor: "pointer", color: "#0d6efd"}} 
                                        onClick={async () => {
                                            setValueConfirm("");
                                            setTimeLeft(-1);
                                            await sendOtp();
                                        }}
                                    >
                                        Gửi lại
                                    </span>
                                </div>
                            </Col>
                        )
                    }
                </Row>
            </Modal>
        </>
    )
}

export default ConfirmAdmin;