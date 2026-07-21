import React from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./Stepper.module.css";

interface StepperProps {
    steps: string[];
    currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className={styles.stepper}>
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                    <div
                        key={step}
                        className={`${styles.step} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
                    >
                        <div className={styles.circle}>
                            {isCompleted ? <FiCheck /> : index + 1}
                        </div>
                        <div className={styles.label}>{step}</div>
                    </div>
                );
            })}
        </div>
    );
}
