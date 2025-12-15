import React from "react";
import styles from "./ConversationList.module.css";

const SearchBox: React.FC = () => {
    return (
        <div className={styles.searchBox}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search" />
        </div>
    );
};

export default SearchBox;