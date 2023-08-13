import React from "react";
import styles from "../styles/loading.module.css";

const Loading = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.cover}></div>
            <div className={styles.loadingText}>Loading...</div>
        </div>
    );
};

export default Loading;
