import React from "react";
import styles from "./Inbox.module.css";

const Inbox = () => {
  // Placeholder for future conversations logic
  const conversations = [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2 className={styles.title}>Inbox</h2>
            <div className={styles.emptyState}>
              No Friends found. Try connecting with more Developers!
            </div>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.centeredMessage}>
            Select a Friend to start chatting.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox; 

