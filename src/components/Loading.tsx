import type { JSX } from "react";
import "./Loading.scss";

const Loading = (): JSX.Element => {
    return(
        <>
            <div className="overlay-spinner d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="sr-only"></span>
                </div>
            </div>
        </>
    );
}

export default Loading;