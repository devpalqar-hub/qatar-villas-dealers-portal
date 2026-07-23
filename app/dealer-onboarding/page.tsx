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
import { useDealerOnboarding } from "@/hooks/useDealerOnboarding";
import { BasicInfoData, BusinessDetailsData } from "@/services/dealerOnboarding.service";
import { uploadFileToS3 } from "@/services/upload.service";
import StatusCard from "@/components/dealer-onboarding/StatusCard";
import SubmissionSuccess from "@/components/dealer-onboarding/SubmissionSuccess";
import styles from "./page.module.css";

export default function DealerOnboardingPage() {
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

    // Documents state per type (Trade License, RERA, Logo, Other)
    const [docFiles, setDocFiles] = useState<{
        tradeLicense: File | null;
        reraCertificate: File | null;
        companyLogo: File | null;
        otherDoc: File | null;
    }>({
        tradeLicense: null,
        reraCertificate: null,
        companyLogo: null,
        otherDoc: null,
    });
    const [uploading, setUploading] = useState(false);

    // Refs for hidden file inputs
    const tradeLicenseRef = useRef<HTMLInputElement>(null);
    const reraRef = useRef<HTMLInputElement>(null);
    const logoRef = useRef<HTMLInputElement>(null);
    const otherDocRef = useRef<HTMLInputElement>(null);

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
        if (!basicInfo.dealerName.trim()) errs.dealerName = "Agency Name is required";
        if (!basicInfo.contactName.trim()) errs.contactName = "Contact Person is required";
        if (!basicInfo.email.trim()) {
            errs.email = "Business Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
            errs.email = "Invalid email format";
        }
        if (!basicInfo.phone.trim()) errs.phone = "Phone Number is required";

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

    const handleFileSelect = (key: keyof typeof docFiles, file: File | null) => {
        if (file) {
            setDocFiles((prev) => ({ ...prev, [key]: file }));
        }
    };

    const handleBizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!bizData.tradeNumber.trim()) errs.tradeNumber = "Trade License Number is required";
        if (!bizData.address.trim()) errs.address = "Registered Address is required";
        if (!bizData.city.trim()) errs.city = "City is required";
        if (!bizData.country.trim()) errs.country = "Country is required";

        if (Object.keys(errs).length > 0) {
            setBizErrors(errs);
            return;
        }

        // Upload files to S3 if attached
        let documentUrls: string[] = [];
        const filesToUpload = Object.values(docFiles).filter(Boolean) as File[];

        if (filesToUpload.length > 0) {
            setUploading(true);
            try {
                documentUrls = await uploadFileToS3(filesToUpload);
            } catch (err: any) {
                setError(err.message || "Failed to upload documents. Please try again.");
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        const payload: BusinessDetailsData = {
            tradeNumber: bizData.tradeNumber,
            ...(bizData.reraNumber ? { reraNumber: bizData.reraNumber } : {}),
            address: bizData.address,
            city: bizData.city,
            country: bizData.country,
            ...(bizData.website ? { website: bizData.website } : {}),
            ...(bizData.description ? { description: bizData.description } : {}),
            ...(documentUrls.length > 0 ? { documents: documentUrls } : {}),
        };

        try {
            await submitBusinessDetails(payload);
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
                        <h1 className={styles.editTitle}>Application Details</h1>
                        <p className={styles.editSubtitle}>
                            Please update the information below and submit your application.
                        </p>
                    </div>

                    <form onSubmit={handleBizSubmit}>
                        {/* Section 1: Agency Information (Prefilled / Readonly display) */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>Agency Information</h2>
                            <div className={styles.grid2}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        Agency Name <span className={styles.requiredStar}>*</span>
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
                                            placeholder="Agency Name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Contact Person <span className={styles.requiredStar}>*</span>
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
                                            placeholder="Contact Person"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Email <span className={styles.requiredStar}>*</span>
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
                                            placeholder="email@domain.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Phone Number <span className={styles.requiredStar}>*</span>
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
                                            placeholder="Phone Number"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Details */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>Business Details</h2>
                            <div className={styles.grid2}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        Trade License Number <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="tradeNumber"
                                        className={`${styles.textInput} ${bizErrors.tradeNumber ? styles.textInputError : ""
                                            }`}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.tradeNumber}
                                        onChange={handleBizChange}
                                        placeholder="e.g. 12345/2024"
                                        required
                                    />
                                    {bizErrors.tradeNumber && (
                                        <span className={styles.errorText}>{bizErrors.tradeNumber}</span>
                                    )}
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>RERA Number</label>
                                    <input
                                        type="text"
                                        name="reraNumber"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.reraNumber}
                                        onChange={handleBizChange}
                                        placeholder="e.g. RERA-2024-67890"
                                    />
                                </div>

                                <div className={styles.fullWidth}>
                                    <label className={styles.fieldLabel}>
                                        Registered Address <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        className={`${styles.textInput} ${bizErrors.address ? styles.textInputError : ""
                                            }`}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.address}
                                        onChange={handleBizChange}
                                        placeholder="Street, Building, Office number"
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
                                        City <span className={styles.requiredStar}>*</span>
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
                                        Country <span className={styles.requiredStar}>*</span>
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
                                    <label className={styles.fieldLabel}>Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.website}
                                        onChange={handleBizChange}
                                        placeholder="https://agency.qa"
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth} style={{ marginTop: "20px" }}>
                                <label className={styles.fieldLabel}>Business Description</label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    value={bizData.description}
                                    onChange={handleBizChange}
                                    maxLength={500}
                                    placeholder="Brief description of your real estate agency..."
                                />
                                <div className={styles.charCount}>
                                    {bizData.description.length} / 500
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Documents Upload Grid */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>Documents</h2>
                            <p className={styles.sectionSubHeading}>
                                Please upload the required documents for agency verification.
                            </p>

                            <div className={styles.docGrid}>
                                {/* Document 1: Trade License */}
                                <div className={styles.docCard}>
                                    <div className={styles.docHeader}>
                                        <span className={styles.docName}>
                                            Trade License <span className={styles.requiredStar}>*</span>
                                        </span>
                                        {docFiles.tradeLicense ? (
                                            <span className={styles.badgeApproved}>Attached</span>
                                        ) : (
                                            <span className={styles.badgeRequired}>Required</span>
                                        )}
                                    </div>
                                    <div className={styles.filePreviewBox}>
                                        <FiFileText className={styles.fileIcon} />
                                        <div className={styles.fileMeta}>
                                            <span className={styles.fileName}>
                                                {docFiles.tradeLicense
                                                    ? docFiles.tradeLicense.name
                                                    : "trade_license.pdf"}
                                            </span>
                                            <span className={styles.fileDate}>
                                                {docFiles.tradeLicense ? "Ready to upload" : "No file chosen"}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={tradeLicenseRef}
                                        style={{ display: "none" }}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) =>
                                            handleFileSelect("tradeLicense", e.target.files?.[0] || null)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={styles.uploadActionBtn}
                                        onClick={() => tradeLicenseRef.current?.click()}
                                    >
                                        {docFiles.tradeLicense ? "Replace File" : "Upload File"}
                                    </button>
                                    <span className={styles.docHint}>PDF, PNG, JPG (Max. 10MB)</span>
                                </div>

                                {/* Document 2: RERA Certificate */}
                                <div className={styles.docCard}>
                                    <div className={styles.docHeader}>
                                        <span className={styles.docName}>RERA Certificate</span>
                                        {docFiles.reraCertificate ? (
                                            <span className={styles.badgeApproved}>Attached</span>
                                        ) : (
                                            <span className={styles.badgePending}>Optional</span>
                                        )}
                                    </div>
                                    <div className={styles.filePreviewBox}>
                                        <FiFileText className={styles.fileIcon} />
                                        <div className={styles.fileMeta}>
                                            <span className={styles.fileName}>
                                                {docFiles.reraCertificate
                                                    ? docFiles.reraCertificate.name
                                                    : "rera_certificate.pdf"}
                                            </span>
                                            <span className={styles.fileDate}>
                                                {docFiles.reraCertificate ? "Ready to upload" : "No file chosen"}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={reraRef}
                                        style={{ display: "none" }}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) =>
                                            handleFileSelect("reraCertificate", e.target.files?.[0] || null)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={styles.uploadActionBtn}
                                        onClick={() => reraRef.current?.click()}
                                    >
                                        {docFiles.reraCertificate ? "Replace File" : "Upload File"}
                                    </button>
                                    <span className={styles.docHint}>PDF, PNG, JPG (Max. 10MB)</span>
                                </div>

                                {/* Document 3: Company Logo */}
                                <div className={styles.docCard}>
                                    <div className={styles.docHeader}>
                                        <span className={styles.docName}>Company Logo</span>
                                        {docFiles.companyLogo ? (
                                            <span className={styles.badgeApproved}>Attached</span>
                                        ) : (
                                            <span className={styles.badgePending}>Optional</span>
                                        )}
                                    </div>
                                    <div className={styles.filePreviewBox}>
                                        <FiFileText className={styles.fileIcon} />
                                        <div className={styles.fileMeta}>
                                            <span className={styles.fileName}>
                                                {docFiles.companyLogo
                                                    ? docFiles.companyLogo.name
                                                    : "company_logo.png"}
                                            </span>
                                            <span className={styles.fileDate}>
                                                {docFiles.companyLogo ? "Ready to upload" : "No file chosen"}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={logoRef}
                                        style={{ display: "none" }}
                                        accept=".png,.jpg,.jpeg,.svg"
                                        onChange={(e) =>
                                            handleFileSelect("companyLogo", e.target.files?.[0] || null)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={styles.uploadActionBtn}
                                        onClick={() => logoRef.current?.click()}
                                    >
                                        {docFiles.companyLogo ? "Replace File" : "Upload File"}
                                    </button>
                                    <span className={styles.docHint}>PNG, JPG (Max. 5MB)</span>
                                </div>

                                {/* Document 4: Other Documents */}
                                <div className={styles.docCard}>
                                    <div className={styles.docHeader}>
                                        <span className={styles.docName}>Other Documents</span>
                                        {docFiles.otherDoc ? (
                                            <span className={styles.badgeApproved}>Attached</span>
                                        ) : (
                                            <span className={styles.badgePending}>Optional</span>
                                        )}
                                    </div>
                                    <div className={styles.filePreviewBox}>
                                        <FiFileText className={styles.fileIcon} />
                                        <div className={styles.fileMeta}>
                                            <span className={styles.fileName}>
                                                {docFiles.otherDoc
                                                    ? docFiles.otherDoc.name
                                                    : "other_document.pdf"}
                                            </span>
                                            <span className={styles.fileDate}>
                                                {docFiles.otherDoc ? "Ready to upload" : "No file chosen"}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={otherDocRef}
                                        style={{ display: "none" }}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) =>
                                            handleFileSelect("otherDoc", e.target.files?.[0] || null)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={styles.uploadActionBtn}
                                        onClick={() => otherDocRef.current?.click()}
                                    >
                                        {docFiles.otherDoc ? "Replace File" : "Upload File"}
                                    </button>
                                    <span className={styles.docHint}>PDF, PNG, JPG (Max. 10MB)</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className={styles.footerNav}>
                            <button
                                type="button"
                                className={styles.backBtn}
                                onClick={() => window.location.reload()}
                            >
                                <FiArrowLeft /> Back
                            </button>

                            <button
                                type="submit"
                                className={styles.resubmitBtn}
                                disabled={loading || uploading}
                            >
                                {loading || uploading ? (
                                    "Submitting Application..."
                                ) : (
                                    <>
                                        Submit Application <FiSend />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Site Footer */}
                    <footer className={styles.siteFooter}>
                        <span>© 2024 Villas Qatar. All rights reserved.</span> |{" "}
                        <a href="#">Terms of Service</a> | <a href="#">Privacy Policy</a> |{" "}
                        <a href="#">Contact Us</a>
                    </footer>
                </div>
            ) : (
                /* ── PAGE 1: SPLIT HERO & REGISTER YOUR AGENCY FORM ── */
                <div className={styles.splitLayout}>
                    {/* Left Form Panel */}
                    <div className={styles.leftPanel}>
                        <h1 className={styles.title}>
                            Register <span className={styles.highlightTitle}>Your Agency</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Let's get started! Please enter your agency and contact details to begin your
                            onboarding journey.
                        </p>

                        <form onSubmit={handleBasicSubmit}>
                            {/* Agency Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Agency Name</label>
                                <div className={styles.inputWrapper}>
                                    <FiHome className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="dealerName"
                                        className={`${styles.textInput} ${basicErrors.dealerName ? styles.textInputError : ""
                                            }`}
                                        placeholder="Enter agency / company name"
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
                                <label className={styles.fieldLabel}>Contact Person</label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="contactName"
                                        className={`${styles.textInput} ${basicErrors.contactName ? styles.textInputError : ""
                                            }`}
                                        placeholder="Enter full name of contact person"
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
                                <label className={styles.fieldLabel}>Business Email</label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        name="email"
                                        className={`${styles.textInput} ${basicErrors.email ? styles.textInputError : ""
                                            }`}
                                        placeholder="Enter business email address"
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
                                <label className={styles.fieldLabel}>Phone Number</label>
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
                                        placeholder="Enter phone number"
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
                                    {loading ? "Processing..." : <>Continue <FiArrowRight /></>}
                                </button>

                                <div className={styles.securityNote}>
                                    <FiShield className={styles.securityIcon} />
                                    <span>Your information is secure and will not be shared.</span>
                                </div>
                            </div>
                        </form>

                        <div className={styles.statusCheckLink}>
                            Already applied?{" "}
                            <Link href="/dealer-onboarding/status">Check Application Status</Link>
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
                    M0.18,0
                    C0.06,0.08 0,0.25 0,0.5
                    C0,0.75 0.06,0.92 0.18,1
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
                            </div>
                        </>
                    </div>
                </div>
            )}
        </div>
    );
}
