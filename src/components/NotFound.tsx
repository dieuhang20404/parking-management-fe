import { useNavigate } from "react-router-dom";
import "./NotFound.scss";

const NotFound = () => {
    const navigate = useNavigate();
    const goHome = () => {
        return navigate("/");
    }
    
    return (
        <div className="custom-bg">
            <div className="d-flex align-items-center justify-content-center min-vh-100 px-2">
                <div className="text-center">
                    <h1 className="display-1 fw-bold">404</h1>
                    <p className="fs-2 fw-medium mt-4">Không tìm thấy trang!</p>
                    <p className="mt-4 mb-5">Trang bạn đang tìm đã biến mất hoặc thay đổi.</p>
                    <button className="btn btn-light fw-semibold rounded-pill px-4 py-2 custom-btn" onClick={() => goHome()}>
                        Về trang chủ
                    </button>
                </div>
            </div>
            <div className="img-bg">
                <img src="https://res.cloudinary.com/dibigdhgr/image/upload/v1756132945/bg-not-found_f6wo3y.png" />
            </div>
        </div>
    )
}

export default NotFound;