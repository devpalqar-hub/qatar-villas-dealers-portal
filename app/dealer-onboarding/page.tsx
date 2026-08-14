"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiHome,
    FiUser,
    FiMail,
    FiShield,
    FiArrowRight,
    FiX,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiArrowLeft,
    FiSend,
    FiUploadCloud,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useDealerOnboarding } from "@/hooks/useDealerOnboarding";
import { BasicInfoData, BusinessDetailsData } from "@/services/dealerOnboarding.service";
// uploadFileToS3 not used here – files sent as multipart form-data directly
import StatusCard from "@/components/dealer-onboarding/StatusCard";
import SubmissionSuccess from "@/components/dealer-onboarding/SubmissionSuccess";
import styles from "./page.module.css";

export default function DealerOnboardingPage() {
    const t1 = useTranslations("onboarding.page1");
    const t2 = useTranslations("onboarding.page2");
    const tFooter = useTranslations("onboarding.footer");
    const {
        loading,
        error,
        setError,
        submissionId,
        currentStep,
        onboardingStatusData,
        startApplication,
        submitBusinessDetails,
        checkStatus,
    } = useDealerOnboarding();

    // ── Page 1 Form State (Basic Info) ──
    const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
        dealerName: "",
        contactName: "",
        email: "",
        phone: "",
    });
    const [basicErrors, setBasicErrors] = useState<Partial<BasicInfoData>>({});

    // ── Page 2 Form State (Business Details & Documents) ──
    const [bizData, setBizData] = useState<{
        tradeNumber: string;
        reraNumber: string;
        address: string;
        city: string;
        country: string;
        website: string;
        description: string;
    }>({
        tradeNumber: "",
        reraNumber: "",
        address: "",
        city: "Doha",
        country: "Qatar",
        website: "",
        description: "",
    });
    const [bizErrors, setBizErrors] = useState<Record<string, string>>({});

    // Documents state (single common document upload list)
    const [documentFiles, setDocumentFiles] = useState<File[]>([]);
    const [docError, setDocError] = useState<string | null>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    // ── Handlers Page 1 ──
    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBasicInfo((prev) => ({ ...prev, [name]: value }));
        if (basicErrors[name as keyof BasicInfoData]) {
            setBasicErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBasicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Partial<BasicInfoData> = {};
        if (!basicInfo.dealerName.trim()) errs.dealerName = t1("errors.dealerName");
        if (!basicInfo.contactName.trim()) errs.contactName = t1("errors.contactName");
        if (!basicInfo.email.trim()) {
            errs.email = t1("errors.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
            errs.email = t1("errors.emailInvalid");
        }
        if (!basicInfo.phone.trim()) errs.phone = t1("errors.phone");

        if (Object.keys(errs).length > 0) {
            setBasicErrors(errs);
            return;
        }

        try {
            await startApplication(basicInfo);
        } catch (err) {
            // Error handled in hook
        }
    };

    // ── Handlers Page 2 ──
    const handleBizChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setBizData((prev) => ({ ...prev, [name]: value }));
        if (bizErrors[name]) {
            setBizErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        setDocumentFiles((prev) => [...prev, ...newFiles]);
        setDocError(null);
        // Reset input so same file can be re-added if removed
        e.target.value = "";
    };

    const handleRemoveDoc = (index: number) => {
        setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleBizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!bizData.tradeNumber.trim()) errs.tradeNumber = t2("errors.tradeNumber");
        if (!bizData.address.trim()) errs.address = t2("errors.address");
        if (!bizData.city.trim()) errs.city = t2("errors.city");
        if (!bizData.country.trim()) errs.country = t2("errors.country");

        if (Object.keys(errs).length > 0) {
            setBizErrors(errs);
            return;
        }

        // At least one document is required
        if (documentFiles.length === 0) {
            setDocError(t2("documentRequired"));
            return;
        }

        // Build multipart FormData — backend expects documents as file uploads
        const formData = new FormData();
        formData.append("tradeNumber", bizData.tradeNumber);
        if (bizData.reraNumber) formData.append("reraNumber", bizData.reraNumber);
        formData.append("address", bizData.address);
        formData.append("city", bizData.city);
        formData.append("country", bizData.country);
        if (bizData.website) formData.append("website", bizData.website);
        if (bizData.description) formData.append("description", bizData.description);
        documentFiles.forEach((file) => formData.append("documents", file));

        try {
            await submitBusinessDetails(formData);
        } catch (err) {
            // Error handled in hook
        }
    };

    return (
        <div className={styles.mainContainer}>
            {error && (
                <div style={{ padding: "16px 24px 0 24px", maxWidth: "1080px", margin: "0 auto" }}>
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>
                            <FiX />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STATUS VIEW (Step 4) ── */}
            {currentStep === 4 && onboardingStatusData ? (
                <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
                    <StatusCard
                        data={onboardingStatusData}
                        onRefresh={() => checkStatus()}
                        loading={loading}
                    />
                </div>
            ) : currentStep === 3 ? (
                /* ── SUBMISSION SUCCESS (Step 3) ── */
                <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
                    <SubmissionSuccess
                        submissionId={submissionId!}
                        onCheckStatus={() => checkStatus(submissionId!)}
                    />
                </div>
            ) : currentStep === 2 ? (
                /* ── PAGE 2: EDIT / APPLICATION DETAILS ── */
                <div className={styles.editContainer}>
                    <div className={styles.editPageHeader}>
                        <h1 className={styles.editTitle}>{t2("title")}</h1>
                        <p className={styles.editSubtitle}>
                            {t2("subtitle")}
                        </p>
                    </div>

                    <form onSubmit={handleBizSubmit}>
                        {/* Section 1: Agency Information (Prefilled / Readonly display) */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>{t2("agencyInfoHeading")}</h2>
                            <div className={styles.grid2}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("agencyName")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FiHome className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.textInput}
                                            value={basicInfo.dealerName}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    dealerName: e.target.value,
                                                }))
                                            }
                                            placeholder={t2("agencyName")}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("contactPerson")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FiUser className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.textInput}
                                            value={basicInfo.contactName}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    contactName: e.target.value,
                                                }))
                                            }
                                            placeholder={t2("contactPerson")}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("email")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FiMail className={styles.inputIcon} />
                                        <input
                                            type="email"
                                            className={styles.textInput}
                                            value={basicInfo.email}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            placeholder={t2("emailPlaceholder")}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("phoneNumber")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.phoneGroup}>
                                        <div className={styles.flagPrefix}>
                                            <img
                                                src="https://flagcdn.com/w40/qa.png"
                                                alt="Qatar"
                                                className={styles.flagIcon}
                                            />
                                            <span>+974</span>
                                        </div>
                                        <input
                                            type="tel"
                                            className={styles.phoneInputNoBorder}
                                            value={basicInfo.phone}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            placeholder={t2("phoneNumber")}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Details */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>{t2("businessDetailsHeading")}</h2>
                            <div className={styles.grid2}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("tradeLicenseNumber")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="tradeNumber"
                                        className={`${styles.textInput} ${bizErrors.tradeNumber ? styles.textInputError : ""
                                            }`}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.tradeNumber}
                                        onChange={handleBizChange}
                                        placeholder={t2("tradeLicensePlaceholder")}
                                        required
                                    />
                                    {bizErrors.tradeNumber && (
                                        <span className={styles.errorText}>{bizErrors.tradeNumber}</span>
                                    )}
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>{t2("reraNumber")}</label>
                                    <input
                                        type="text"
                                        name="reraNumber"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.reraNumber}
                                        onChange={handleBizChange}
                                        placeholder={t2("reraPlaceholder")}
                                    />
                                </div>

                                <div className={styles.fullWidth}>
                                    <label className={styles.fieldLabel}>
                                        {t2("registeredAddress")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        className={`${styles.textInput} ${bizErrors.address ? styles.textInputError : ""
                                            }`}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.address}
                                        onChange={handleBizChange}
                                        placeholder={t2("registeredAddressPlaceholder")}
                                        required
                                    />
                                    {bizErrors.address && (
                                        <span className={styles.errorText}>{bizErrors.address}</span>
                                    )}
                                </div>
                            </div>

                            <div className={`${styles.grid3} ${styles.fullWidth}`} style={{ marginTop: "20px" }}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("city")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.city}
                                        onChange={handleBizChange}
                                        placeholder="Doha"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        {t2("country")} <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <select
                                        name="country"
                                        className={styles.selectInput}
                                        value={bizData.country}
                                        onChange={handleBizChange}
                                        required
                                    >
                                        <option value="Qatar">Qatar</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                        <option value="Kuwait">Kuwait</option>
                                        <option value="Bahrain">Bahrain</option>
                                        <option value="Oman">Oman</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>{t2("website")}</label>
                                    <input
                                        type="url"
                                        name="website"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.website}
                                        onChange={handleBizChange}
                                        placeholder={t2("websitePlaceholder")}
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth} style={{ marginTop: "20px" }}>
                                <label className={styles.fieldLabel}>{t2("businessDescription")}</label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    value={bizData.description}
                                    onChange={handleBizChange}
                                    maxLength={500}
                                    placeholder={t2("businessDescriptionPlaceholder")}
                                />
                                <div className={styles.charCount}>
                                    {bizData.description.length} / 500
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Documents Upload */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>
                                {t2("documentsHeading")} <span className={styles.requiredStar}>*</span>
                            </h2>
                            <p className={styles.sectionSubHeading}>
                                {t2("documentsSubHeading")}
                            </p>

                            {/* Drop Zone */}
                            <div
                                className={styles.fileUploadArea}
                                onClick={() => docInputRef.current?.click()}
                                style={docError ? { borderColor: "#dc2626" } : undefined}
                            >
                                <FiUploadCloud className={styles.uploadIcon} />
                                <span className={styles.uploadText}>{t2("uploadDocuments")}</span>
                                <span className={styles.uploadHint}>{t2("uploadHint")}</span>
                                <input
                                    ref={docInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    style={{ display: "none" }}
                                    onChange={handleDocFileChange}
                                />
                            </div>

                            {docError && (
                                <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>
                                    {docError}
                                </p>
                            )}

                            {/* Uploaded file list */}
                            {documentFiles.length > 0 && (
                                <div className={styles.fileListGrid} style={{ marginTop: "16px" }}>
                                    {documentFiles.map((file, idx) => (
                                        <div key={idx} className={styles.fileItemCard}>
                                            <FiFileText style={{ color: "#8A1538", fontSize: "20px", flexShrink: 0 }} />
                                            <div className={styles.fileMetaInfo}>
                                                <span className={styles.fileNameText}>{file.name}</span>
                                                <span className={styles.fileSizeText}>{formatFileSize(file.size)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.removeFileBtn}
                                                onClick={() => handleRemoveDoc(idx)}
                                                aria-label={t2("removeFile")}
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className={styles.footerNav}>
                            <button
                                type="button"
                                className={styles.backBtn}
                                onClick={() => window.location.reload()}
                            >
                                <FiArrowLeft /> {t2("back")}
                            </button>

                            <button
                                type="submit"
                                className={styles.resubmitBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    t2("submitting")
                                ) : (
                                    <>
                                        {t2("submitApplication")} <FiSend />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Site Footer */}
                    <footer className={styles.siteFooter}>
                        <span>{tFooter("copyright", { year: new Date().getFullYear() })}</span> |{" "}
                        <a href="#">{tFooter("terms")}</a> | <a href="#">{tFooter("privacy")}</a> |{" "}
                        <a href="#">{tFooter("contact")}</a>
                    </footer>
                </div>
            ) : (
                /* ── PAGE 1: SPLIT HERO & REGISTER YOUR AGENCY FORM ── */
                <div className={styles.splitLayout}>
                    {/* Left Form Panel */}
                    <div className={styles.leftPanel}>
                        <h1 className={styles.title}>
                            {t1("titlePrefix")} <span className={styles.highlightTitle}>{t1("titleHighlight")}</span>
                        </h1>
                        <p className={styles.subtitle}>
                            {t1("subtitle")}
                        </p>

                        <form onSubmit={handleBasicSubmit}>
                            {/* Agency Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>{t1("agencyName")}</label>
                                <div className={styles.inputWrapper}>
                                    <FiHome className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="dealerName"
                                        className={`${styles.textInput} ${basicErrors.dealerName ? styles.textInputError : ""
                                            }`}
                                        placeholder={t1("agencyNamePlaceholder")}
                                        value={basicInfo.dealerName}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.dealerName && (
                                    <span className={styles.errorText}>{basicErrors.dealerName}</span>
                                )}
                            </div>

                            {/* Contact Person */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>{t1("contactPerson")}</label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="contactName"
                                        className={`${styles.textInput} ${basicErrors.contactName ? styles.textInputError : ""
                                            }`}
                                        placeholder={t1("contactPersonPlaceholder")}
                                        value={basicInfo.contactName}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.contactName && (
                                    <span className={styles.errorText}>{basicErrors.contactName}</span>
                                )}
                            </div>

                            {/* Business Email */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>{t1("businessEmail")}</label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        name="email"
                                        className={`${styles.textInput} ${basicErrors.email ? styles.textInputError : ""
                                            }`}
                                        placeholder={t1("businessEmailPlaceholder")}
                                        value={basicInfo.email}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.email && (
                                    <span className={styles.errorText}>{basicErrors.email}</span>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>{t1("phoneNumber")}</label>
                                <div className={styles.phoneGroup}>
                                    <div className={styles.flagPrefix}>
                                        <img
                                            src="https://flagcdn.com/w40/qa.png"
                                            alt="Qatar"
                                            className={styles.flagIcon}
                                        />
                                        <span>+974</span>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={styles.phoneInputNoBorder}
                                        placeholder={t1("phoneNumberPlaceholder")}
                                        value={basicInfo.phone}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.phone && (
                                    <span className={styles.errorText}>{basicErrors.phone}</span>
                                )}
                            </div>

                            {/* Submit Row */}
                            <div className={styles.submitRow}>
                                <button
                                    type="submit"
                                    className={styles.continueBtn}
                                    disabled={loading}
                                >
                                    {loading ? t1("processing") : <>{t1("continue")} <FiArrowRight /></>}
                                </button>

                                <div className={styles.securityNote}>
                                    <FiShield className={styles.securityIcon} />
                                    <span>{t1("securityNote")}</span>
                                </div>
                            </div>
                        </form>

                        <div className={styles.statusCheckLink}>
                            {t1("alreadyApplied")}{" "}
                            <Link href="/dealer-onboarding/status">{t1("checkApplicationStatus")}</Link>
                        </div>
                    </div>

                    {/* Right Hero Image Panel */}
                    <div className={styles.rightPanel}>
                        <>
                            <svg width="0" height="0">
                                <defs>
                                    <clipPath id="heroClip" clipPathUnits="objectBoundingBox">
                                        <path
                                            d="
                    M0.22,0
                    C0.18,0.08 0,0.47 0,0.5
                    C0,0.68 0.5,1.7 0.22,1
                    L1,1
                    L1,0
                    Z
                "
                                        />
                                    </clipPath>
                                </defs>
                            </svg>

                            <div className={styles.heroImageContainer}>
                                <Image
                                    src="/dealer-onboard-hero.jpeg"
                                    alt="Villas Qatar Onboarding"
                                    fill
                                    priority
                                    className={styles.heroImg}
                                />
                                <div className={styles.heroOverlay} />
                            </div>
                        </>
                    </div>
                </div>
            )}
        </div>
    );
}
