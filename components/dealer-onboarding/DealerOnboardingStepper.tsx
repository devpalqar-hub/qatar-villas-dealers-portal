import { FiCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";
import styles from "./DealerOnboardingStepper.module.css";

interface StepperProps {
    currentStep: number;
}

export default function DealerOnboardingStepper({ currentStep }: StepperProps) {
    const t = useTranslations("onboarding.stepper");
    const steps = [
        { id: 1, label: t("basicInfo") },
        { id: 2, label: t("businessDetails") },
        { id: 3, label: t("submitted") },
    ];
    return (
        <div className={styles.stepperContainer}>
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.id || (currentStep >= 3 && step.id === 3);
                const isActive = currentStep === step.id;

                return (
                    <div key={step.id} style={{ display: "flex", alignItems: "center", flex: index === steps.length - 1 ? 0 : 1 }}>
                        <div className={styles.stepWrapper}>
                            <div
                                className={`${styles.stepIcon} ${isActive ? styles.active : ""
                                    } ${isCompleted ? styles.completed : ""}`}
                            >
                                {isCompleted ? <FiCheck /> : step.id}
                            </div>
                            <span
                                className={`${styles.stepLabel} ${isActive ? styles.active : ""
                                    } ${isCompleted ? styles.completed : ""}`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`${styles.connector} ${currentStep > step.id ? styles.completed : ""
                                    }`}
                            ></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}