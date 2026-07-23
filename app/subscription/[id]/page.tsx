"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiHome,
    FiCalendar,
    FiZap,
    FiShield,
    FiArrowRight,
    FiCheck,
    FiChevronRight,
    FiChevronDown,
    FiLock,
    FiShoppingCart,
    FiCreditCard,
    FiAward,
    FiBarChart2,
    FiEye,
    FiTrendingUp,
    FiDollarSign,
    FiHeadphones,
    FiKey,
} from "react-icons/fi";
import { FaStar, FaGem, FaCrown, FaLandmark } from "react-icons/fa";
import { AppLayout } from "@/components/ui";
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/types/subscription";
import styles from "./page.module.css";

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
];

const FAQ_ITEMS = [
    {
        question: "How do subscriptions work?",
        answer: "Subscriptions grant active listing slots, boost discounts, and enhanced visibility. You can choose a 30-day or 365-day validity period based on your agency requirements.",
    },
    {
        question: "Can I upgrade or downgrade later?",
        answer: "Yes! Upgrades take effect immediately, and any unused days on your previous plan are automatically calculated as a pro-rated credit towards your new plan.",
    },
    {
        question: "Do plans renew automatically?",
        answer: "By default, paid plans renew automatically at the end of each billing cycle to prevent property listing expiration. You can toggle auto-renewal in settings at any time.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes, you can cancel your subscription auto-renewal at any time. Your benefits will remain active until the end of the current validity period.",
    },
    {
        question: "Is there a refund policy?",
        answer: "We provide a 7-day money-back guarantee for initial plan purchases if no boosted property promotions have been activated.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept Visa, Mastercard, QPay, Debit Cards, and direct Qatar bank wire transfers with instant activation upon payment confirmation.",
    },
];

export default function SubscriptionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const planId = (params?.id as string) || "";

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!planId) return;

        const fetchPlanDetail = async () => {
            setLoading(true);
            try {
                const data = await subscriptionService.getPlanById(planId);
                if (data) {
                    setPlan(data);
                }
            } catch (error) {
                console.error("Error fetching subscription plan by ID:", error);
                // Fallback mock detail matching requested Enterprise/Pro plan structures if ID fails
                setPlan({
                    id: planId,
                    name: planId.includes("pro") ? "Pro Plan" : "Enterprise Plan",
                    maxListings: planId.includes("pro") ? 50 : 0,
                    validityDays: 30,
                    price: planId.includes("pro") ? 500 : 1500,
                    boostDiscountPercent: planId.includes("pro") ? 10 : 25,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPlanDetail();
    }, [planId]);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const isUnlimited = plan?.maxListings === 0;
    const isEnterprise = plan?.name?.toLowerCase().includes("enterprise");
    const isPro = plan?.name?.toLowerCase().includes("pro");
    const isGold = plan?.name?.toLowerCase().includes("gold");

    const badgeText = isEnterprise ? "BEST VALUE" : isPro ? "MOST POPULAR" : "FEATURED";

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Top Navigation & Breadcrumbs */}
                <div className={styles.topNav}>
                    <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
                        <Link href="/subscription">Subscription Plans</Link>
                        <span>&gt;</span>
                        <span style={{ color: "var(--text)", fontWeight: 500 }}>
                            {loading ? "Loading Plan..." : plan?.name || "Plan Details"}
                        </span>
                    </nav>

                    <Link href="/subscription" className={styles.backBtn}>
                        <FiArrowLeft size={16} />
                        Back to Plans
                    </Link>
                </div>

                {loading ? (
                    <div className={styles.shimmerHero} />
                ) : (
                    <>
                        {/* Hero Section */}
                        <div className={styles.heroContainer}>
                            <img
                                src={HERO_IMAGES[0]}
                                alt="Luxury Qatar Villa"
                                className={styles.heroBg}
                            />
                            <div className={styles.heroOverlay} />

                            <div className={styles.heroContent}>
                                {/* Left Info Banner */}
                                <div className={styles.heroLeft}>
                                    <span className={styles.badgePill}>{badgeText}</span>
                                    <h1 className={styles.heroTitle}>{plan?.name}</h1>
                                    <p className={styles.heroDesc}>
                                        For agencies that want unlimited growth, premium brand presence, and maximum impact across Qatar real estate.
                                    </p>

                                    <div className={styles.heroMetaRow}>
                                        <div className={styles.metaItem}>
                                            <FiCheckCircle size={15} style={{ color: "#4ade80" }} />
                                            <span>Trusted by Top Agencies</span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <span className={styles.activeDot} />
                                            <span>Active Plan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Floating Purchase Card */}
                                <div className={styles.floatingCard}>
                                    <div className={styles.cardIconBadge}>
                                        {isEnterprise ? <FaStar /> : isGold ? <FaCrown /> : <FaGem />}
                                    </div>

                                    <div className={styles.cardPlanName}>{plan?.name}</div>

                                    <div className={styles.cardPriceRow}>
                                        <span className={styles.cardCurrency}>QAR</span>
                                        <span className={styles.cardPrice}>{plan?.price}</span>
                                    </div>
                                    <div className={styles.cardValidity}>/ {plan?.validityDays} Days</div>

                                    <div className={styles.cardDivider} />

                                    <ul className={styles.cardFeatureList}>
                                        <li className={styles.cardFeatureItem}>
                                            <FiHome className={styles.cardFeatureIcon} />
                                            <span>{isUnlimited ? "Unlimited Listings" : `${plan?.maxListings} Listings`}</span>
                                        </li>
                                        <li className={styles.cardFeatureItem}>
                                            <FiCalendar className={styles.cardFeatureIcon} />
                                            <span>{plan?.validityDays} Days Validity</span>
                                        </li>
                                        <li className={styles.cardFeatureItem}>
                                            <FiZap className={styles.cardFeatureIcon} />
                                            <span>{plan?.boostDiscountPercent}% Boost Discount</span>
                                        </li>
                                        <li className={styles.cardFeatureItem}>
                                            <FiShield className={styles.cardFeatureIcon} />
                                            <span>Priority Support</span>
                                        </li>
                                        <li className={styles.cardFeatureItem}>
                                            <FiAward className={styles.cardFeatureIcon} />
                                            <span>Verified Agency Badge</span>
                                        </li>
                                    </ul>

                                    <button type="button" className={styles.cardSubscribeBtn}>
                                        Subscribe Now
                                        <FiArrowRight size={16} />
                                    </button>

                                    <div className={styles.securityNote}>
                                        <FiLock size={13} />
                                        <span>Secure & Safe Payment</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4 Metric Stats Grid */}
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}>
                                    <FiHome />
                                </div>
                                <div className={styles.metricInfo}>
                                    <span className={styles.metricLabel}>Listings</span>
                                    <span className={styles.metricValue}>
                                        {isUnlimited ? "Unlimited" : plan?.maxListings}
                                    </span>
                                    <span className={styles.metricSubtext}>
                                        List as many properties as you want
                                    </span>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}>
                                    <FiCalendar />
                                </div>
                                <div className={styles.metricInfo}>
                                    <span className={styles.metricLabel}>Validity</span>
                                    <span className={styles.metricValue}>{plan?.validityDays} Days</span>
                                    <span className={styles.metricSubtext}>Full validity access</span>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}>
                                    <FiZap />
                                </div>
                                <div className={styles.metricInfo}>
                                    <span className={styles.metricLabel}>Boost Discount</span>
                                    <span className={styles.metricValue}>{plan?.boostDiscountPercent}%</span>
                                    <span className={styles.metricSubtext}>On all boost promotions</span>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon}>
                                    <FiHeadphones />
                                </div>
                                <div className={styles.metricInfo}>
                                    <span className={styles.metricLabel}>Support</span>
                                    <span className={styles.metricValue}>Priority</span>
                                    <span className={styles.metricSubtext}>24/7 dedicated support</span>
                                </div>
                            </div>
                        </div>

                        {/* Included Features vs Why Upgrade (2 Columns) */}
                        <div className={styles.twoColGrid}>
                            {/* Left Column: What's Included */}
                            <div className={styles.colCard}>
                                <h3 className={styles.colTitle}>What's Included</h3>

                                <div className={styles.includedList}>
                                    <div className={styles.includedItem}>
                                        <div className={styles.itemLeft}>
                                            <div className={styles.itemIcon}>
                                                <FiHome />
                                            </div>
                                            <div className={styles.itemTextGroup}>
                                                <span className={styles.itemTitle}>
                                                    {isUnlimited ? "Unlimited Listings" : `${plan?.maxListings} Active Listings`}
                                                </span>
                                                <span className={styles.itemSub}>
                                                    Publish properties without worrying about limits.
                                                </span>
                                            </div>
                                        </div>
                                        <FiChevronRight className={styles.itemChevron} />
                                    </div>

                                    <div className={styles.includedItem}>
                                        <div className={styles.itemLeft}>
                                            <div className={styles.itemIcon}>
                                                <FiZap />
                                            </div>
                                            <div className={styles.itemTextGroup}>
                                                <span className={styles.itemTitle}>
                                                    {plan?.boostDiscountPercent}% Discount on Boost Promotions
                                                </span>
                                                <span className={styles.itemSub}>
                                                    Get exclusive discount on all your property boost promotions.
                                                </span>
                                            </div>
                                        </div>
                                        <FiChevronRight className={styles.itemChevron} />
                                    </div>

                                    <div className={styles.includedItem}>
                                        <div className={styles.itemLeft}>
                                            <div className={styles.itemIcon}>
                                                <FiHeadphones />
                                            </div>
                                            <div className={styles.itemTextGroup}>
                                                <span className={styles.itemTitle}>Priority Support</span>
                                                <span className={styles.itemSub}>
                                                    Enjoy 24/7 priority support from our expert team.
                                                </span>
                                            </div>
                                        </div>
                                        <FiChevronRight className={styles.itemChevron} />
                                    </div>

                                    <div className={styles.includedItem}>
                                        <div className={styles.itemLeft}>
                                            <div className={styles.itemIcon}>
                                                <FiAward />
                                            </div>
                                            <div className={styles.itemTextGroup}>
                                                <span className={styles.itemTitle}>Verified Agency Badge</span>
                                                <span className={styles.itemSub}>
                                                    Showcase a trusted verified badge on your agency profile.
                                                </span>
                                            </div>
                                        </div>
                                        <FiChevronRight className={styles.itemChevron} />
                                    </div>

                                    <div className={styles.includedItem}>
                                        <div className={styles.itemLeft}>
                                            <div className={styles.itemIcon}>
                                                <FiBarChart2 />
                                            </div>
                                            <div className={styles.itemTextGroup}>
                                                <span className={styles.itemTitle}>Advanced Analytics</span>
                                                <span className={styles.itemSub}>
                                                    Access in-depth analytics and performance insights.
                                                </span>
                                            </div>
                                        </div>
                                        <FiChevronRight className={styles.itemChevron} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Why Upgrade? */}
                            <div className={`${styles.colCard} ${styles.upgradeCardBg}`}>
                                <h3 className={styles.colTitle}>Why Upgrade?</h3>

                                <div className={styles.whyUpgradeList}>
                                    <div className={styles.whyUpgradeItem}>
                                        <div className={styles.itemIcon}>
                                            <FiEye />
                                        </div>
                                        <div className={styles.itemTextGroup}>
                                            <span className={styles.itemTitle}>Increase Visibility</span>
                                            <span className={styles.itemSub}>
                                                Your listings get maximum exposure across top search results.
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.whyUpgradeItem}>
                                        <div className={styles.itemIcon}>
                                            <FiTrendingUp />
                                        </div>
                                        <div className={styles.itemTextGroup}>
                                            <span className={styles.itemTitle}>Generate More Leads</span>
                                            <span className={styles.itemSub}>
                                                Attract high-intent luxury villa buyers and tenants faster.
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.whyUpgradeItem}>
                                        <div className={styles.itemIcon}>
                                            <FiDollarSign />
                                        </div>
                                        <div className={styles.itemTextGroup}>
                                            <span className={styles.itemTitle}>Save More</span>
                                            <span className={styles.itemSub}>
                                                Enjoy higher savings on featured boost packages.
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.whyUpgradeItem}>
                                        <div className={styles.itemIcon}>
                                            <FiAward />
                                        </div>
                                        <div className={styles.itemTextGroup}>
                                            <span className={styles.itemTitle}>Build Trust</span>
                                            <span className={styles.itemSub}>
                                                Verified agency badge builds market credibility instantly.
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.whyUpgradeItem}>
                                        <div className={styles.itemIcon}>
                                            <FiHeadphones />
                                        </div>
                                        <div className={styles.itemTextGroup}>
                                            <span className={styles.itemTitle}>Dedicated Support</span>
                                            <span className={styles.itemSub}>
                                                We're here for you with dedicated account management.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How it Works (5 Step Workflow Timeline) */}
                        <div className={styles.workflowSection}>
                            <div className={styles.workflowHeader}>
                                <h3 className={styles.workflowTitle}>How it Works</h3>
                            </div>

                            <div className={styles.workflowStepsRow}>
                                {/* Step 01 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadgeIconWrapper}>
                                        <span className={styles.stepNumberPill}>01</span>
                                        <div className={styles.stepIconCircle}>
                                            <FiShoppingCart />
                                        </div>
                                    </div>
                                    <h4 className={styles.stepTitle}>Choose Plan</h4>
                                    <p className={styles.stepDesc}>
                                        Pick the plan that fits your business needs.
                                    </p>
                                </div>

                                {/* Step 02 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadgeIconWrapper}>
                                        <span className={styles.stepNumberPill}>02</span>
                                        <div className={styles.stepIconCircle}>
                                            <FiCreditCard />
                                        </div>
                                    </div>
                                    <h4 className={styles.stepTitle}>Complete Payment</h4>
                                    <p className={styles.stepDesc}>
                                        Secure your payment through our safe and trusted gateway.
                                    </p>
                                </div>

                                {/* Step 03 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadgeIconWrapper}>
                                        <span className={styles.stepNumberPill}>03</span>
                                        <div className={styles.stepIconCircle}>
                                            <FiAward />
                                        </div>
                                    </div>
                                    <h4 className={styles.stepTitle}>Subscription Active</h4>
                                    <p className={styles.stepDesc}>
                                        Your plan gets activated instantly.
                                    </p>
                                </div>

                                {/* Step 04 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadgeIconWrapper}>
                                        <span className={styles.stepNumberPill}>04</span>
                                        <div className={styles.stepIconCircle}>
                                            <FiHome />
                                        </div>
                                    </div>
                                    <h4 className={styles.stepTitle}>List Properties</h4>
                                    <p className={styles.stepDesc}>
                                        Add properties and reach thousands of buyers.
                                    </p>
                                </div>

                                {/* Step 05 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadgeIconWrapper}>
                                        <span className={styles.stepNumberPill}>05</span>
                                        <div className={styles.stepIconCircle}>
                                            <FiZap />
                                        </div>
                                    </div>
                                    <h4 className={styles.stepTitle}>Boost & Grow</h4>
                                    <p className={styles.stepDesc}>
                                        Boost listings and generate more leads.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Frequently Asked Questions */}
                        <div className={styles.faqSection}>
                            <div className={styles.workflowHeader}>
                                <h3 className={styles.workflowTitle}>Frequently Asked Questions</h3>
                            </div>

                            <div className={styles.faqGrid}>
                                {FAQ_ITEMS.map((item, idx) => {
                                    const isOpen = openFaqIndex === idx;
                                    return (
                                        <div
                                            key={`detail-faq-${idx}`}
                                            className={`${styles.faqItem} ${
                                                isOpen ? styles.faqItemOpen : ""
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className={styles.faqBtn}
                                                onClick={() => toggleFaq(idx)}
                                            >
                                                <span>{item.question}</span>
                                                <FiChevronDown className={styles.faqChevron} />
                                            </button>
                                            {isOpen && (
                                                <div className={styles.faqAnswer}>{item.answer}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom CTA Banner */}
                        <div className={styles.ctaBanner}>
                            <div>
                                <h3 className={styles.ctaHeading}>Ready to unlock unlimited opportunities?</h3>
                                <p className={styles.ctaSubtext}>
                                    Join premium agencies and grow your business with {plan?.name}.
                                </p>
                            </div>

                            <button type="button" className={styles.ctaBtn}>
                                Subscribe Now
                                <FiArrowRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
