"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { FiPaperclip, FiSmile, FiSend } from "react-icons/fi";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
    onSendMessage: (text: string) => void;
    onAttachImage?: (file: File) => void;
    onTyping?: () => void;
    disabled?: boolean;
}

export default function MessageInput({
    onSendMessage,
    onAttachImage,
    onTyping,
    disabled = false,
}: MessageInputProps) {
    const [text, setText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!text.trim() || disabled) return;
        onSendMessage(text.trim());
        setText("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (onTyping) onTyping();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onAttachImage) {
            onAttachImage(e.target.files[0]);
            e.target.value = "";
        }
    };

    return (
        <div className={styles.footer}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <button
                type="button"
                className={styles.attachBtn}
                onClick={() => fileInputRef.current?.click()}
                title="Attach Image"
                disabled={disabled}
            >
                <FiPaperclip size={20} />
            </button>

            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Type a message..."
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className={styles.emojiBtn}
                    title="Emoji"
                    tabIndex={-1}
                >
                    <FiSmile size={20} />
                </button>
            </div>

            <button
                type="button"
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!text.trim() || disabled}
                title="Send Message"
            >
                <FiSend size={18} />
            </button>
        </div>
    );
}
