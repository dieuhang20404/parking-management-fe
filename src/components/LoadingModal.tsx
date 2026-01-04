import { Modal, Spin } from "antd";
import type { JSX } from "react";
import type { LoadingModalProps } from "../configs/interface";

const LoadingModal = ({message, open}: LoadingModalProps): JSX.Element => {
    return(
        <>
            <Modal
                open={open}
                footer={null}
                title={null}
                centered={true}
                closable={false}
                maskClosable={false}
                width="fit-content"
            >
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 30px", gap: "10px"}}>
                    <div className="spinner-border" role="status" style={{height: "40px", width: "40px"}}>
                        <span className="sr-only"></span>
                    </div>
                    <div style={{fontSize: "20px", textAlign: "center"}}>{message}</div>
                </div>
            </Modal>
        </>
    )
}

export default LoadingModal;