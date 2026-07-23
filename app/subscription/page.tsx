"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiHome,
    FiCheck,
    FiX,
    FiPlus,
    FiHelpCircle,
    FiArrowRight,
    FiCalendar,
    FiShield,
    FiZap,
    FiTrendingUp,
    FiAward,
    FiHeadphones,
    FiLayers,
    FiEye,
    FiDollarSign,
} from "react-icons/fi";
import { FaLandmark, FaGem, FaCrown, FaStar } from "react-icons/fa";
import { AppLayout } from "@/components/ui";
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/types/subscription";
import styles from "./page.module.css";

// High resolution villa luxury architecture banners matching Villas Qatar aesthetic
const PLAN_IMAGES = [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", // Modern Luxury Villa
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", // Exterior Mansion
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", // Living Room Skyline View
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", // Villa Poolside Night
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", // Contemporary Estate
];

interface PlanConfig {
    id: string;
    name: string;
    price: number;
    maxListings: number;
    validityDays: number;
    boostDiscountPercent: number;
    badge?: string;
    isFeatured?: boolean;
    isBestValue?: boolean;
    icon: React.ComponentType<{ className?: string }>;
    image: string;
    support: string;
    agencyFeatures: boolean;
}

const DEFAULT_PLANS: PlanConfig[] = [
    {
        id: "basic-plan",
        name: "Basic Plan",
        price: 0,
        maxListings: 10,
        validityDays: 30,
        boostDiscountPercent: 0,
        icon: FiHome,
        image: PLAN_IMAGES[0],
        support: "Standard Support",
        agencyFeatures: false,
    },
    {
        id: "silver-plan",
        name: "Silver Agency Plan",
        price: 0,
        maxListings: 5,
        validityDays: 365,
        boostDiscountPercent: 0,
        icon: FaLandmark as any,
        image: PLAN_IMAGES[1],
        support: "Standard Support",
        agencyFeatures: false,
    },
    {
        id: "pro-plan",
        name: "Pro Plan",
        price: 500,
        maxListings: 50,
        validityDays: 30,
        boostDiscountPercent: 10,
        badge: "MOST POPULAR",
        isFeatured: true,
        icon: FaGem as any,
        image: PLAN_IMAGES[2],
        support: "Priority Support",
        agencyFeatures: true,
    },
    {
        id: "gold-plan",
        name: "Gold Agency Plan",
        price: 2500,
        maxListings: 50,
        validityDays: 365,
        boostDiscountPercent: 20,
        icon: FaCrown as any,
        image: PLAN_IMAGES[3],
        support: "Priority Support",
        agencyFeatures: true,
    },
    {
        id: "enterprise-plan",
        name: "Enterprise Plan",
        price: 1500,
        maxListings: 0, // Unlimited
        validityDays: 30,
        boostDiscountPercent: 25,
        badge: "BEST VALUE",
        isBestValue: true,
        icon: FaStar as any,
        image: PLAN_IMAGES[4],
        support: "Priority Support",
        agencyFeatures: true,
    },
];

const FAQ_ITEMS = [
    {
        question: "How do subscriptions work?",
        answer: "Subscriptions grant your agency active property listing slots, boost discounts, and enhanced visibility. Choose a 30-day or 365-day plan based on your business volume.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes, you can cancel your subscription auto-renewal at any time. Your active plan benefits will remain accessible until the end of your current billing period.",
    },
    {
        question: "Can I upgrade later?",
        answer: "Absolutely! You can upgrade your subscription at any time. Any remaining days on your current active plan will be prorated automatically towards your new selection.",
    },
    {
        question: "Is there a refund policy?",
        answer: "We offer a 7-day satisfaction guarantee for newly purchased subscription plans, provided you haven't published any boosted listings during the active period.",
    },
    {
        question: "Do plans renew automatically?",
        answer: "By default, paid plans renew automatically at the end of each validity period to prevent your listings from expiring. You can adjust this setting in your profile.",
    },
];

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<PlanConfig[]>(DEFAULT_PLANS);
    const [loading, setLoading] = useState<boolean>(true);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                const response = await subscriptionService.getPlans(1, 10);
                if (response?.data && response.data.length > 0) {
                    const apiDataMap = new Map<string, SubscriptionPlan>();
                    response.data.forEach((p) => {
                        apiDataMap.set(p.name.toLowerCase().trim(), p);
                    });

                    // Merge API response with design preset icons and images
                    const mergedPlans = DEFAULT_PLANS.map((defaultPlan) => {
                        const matched = apiDataMap.get(defaultPlan.name.toLowerCase().trim());
                        if (matched) {
                            return {
                                ...defaultPlan,
                                id: matched.id,
                                price: matched.price,
                                maxListings: matched.maxListings,
                                validityDays: matched.validityDays,
                                boostDiscountPercent: matched.boostDiscountPercent,
                            };
                        }
                        return defaultPlan;
                    });
                    setPlans(mergedPlans);
                }
            } catch (error) {
                console.error("Failed to fetch subscription plans, rendering default design fallback:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const scrollToCompare = () => {
        const el = document.getElementById("compare-plans-section");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    const scrollToTop = () => {
        const el = document.getElementById("plans-grid-section");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Breadcrumb Navigation */}
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <span>&gt;</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>Subscription</span>
                </nav>

                {/* Page Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Subscription Plans</h1>
                        <p className={styles.subtitle}>
                            Choose the perfect plan to grow your business with Villas Qatar.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <button type="button" className={styles.helpBtn}>
                            <FiHelpCircle size={15} />
                            Need help?
                        </button>

                        <button
                            type="button"
                            className={styles.compareHeaderBtn}
                            onClick={scrollToCompare}
                        >
                            Compare Plans
                        </button>
                    </div>
                </div>

                {/* Main Cards Grid Section */}
                <div id="plans-grid-section" className={styles.cardsGrid}>
                    {loading
                        ? Array.from({ length: 5 }).map((_, idx) => (
                              <div key={`shimmer-${idx}`} className={styles.shimmerCard}>
                                  <div className={styles.shimmerBanner} />
                                  <div className={styles.shimmerContent}>
                                      <div className={styles.shimmerBlock} style={{ width: "60%", height: 20 }} />
                                      <div className={styles.shimmerBlock} style={{ width: "40%", height: 32 }} />
                                      <div className={styles.shimmerBlock} style={{ width: "30%", height: 16 }} />
                                      <div className={styles.shimmerBlock} style={{ width: "85%", height: 140 }} />
                                      <div className={styles.shimmerBlock} style={{ width: "100%", height: 40, marginTop: "auto" }} />
                                  </div>
                              </div>
                          ))
                        : plans.map((plan) => {
                              const IconComponent = plan.icon;
                              const isUnlimited = plan.maxListings === 0;

                              return (
                                  <div
                                      key={plan.id}
                                      className={`${styles.card} ${
                                          plan.isFeatured ? styles.cardFeatured : ""
                                      } ${plan.isBestValue ? styles.cardEnterprise : ""}`}
                                  >
                                      {plan.badge && (
                                          <div
                                              className={`${styles.ribbonBadge} ${
                                                  plan.isBestValue ? styles.ribbonBestValue : ""
                                              }`}
                                          >
                                              {plan.badge}
                                          </div>
                                      )}

                                      {/* Villa Banner Header */}
                                      <div className={styles.cardBanner}>
                                          <img
                                              src={plan.image}
                                              alt={`${plan.name} banner`}
                                              className={styles.bannerImg}
                                          />
                                          <div className={styles.cardBannerOverlay} />

                                          {/* Floating Circle Icon */}
                                          <div className={styles.iconBadgeWrapper}>
                                              <div className={styles.iconBadge}>
                                                  <IconComponent />
                                              </div>
                                          </div>
                                      </div>

                                      {/* Card Content Body */}
                                      <div className={styles.cardBody}>
                                          <h3 className={styles.cardTitle}>{plan.name}</h3>

                                          <div className={styles.priceWrapper}>
                                              {plan.price === 0 ? (
                                                  <span className={styles.priceFree}>Free</span>
                                              ) : (
                                                  <>
                                                      <span className={styles.priceCurrency}>QAR</span>
                                                      <span className={styles.priceAmount}>{plan.price}</span>
                                                  </>
                                              )}
                                          </div>

                                          <div className={styles.validityBadge}>
                                              <FiCalendar size={13} />
                                              <span>{plan.validityDays} Days</span>
                                          </div>

                                          {/* Features Bullet List */}
                                          <ul className={styles.featuresList}>
                                              <li className={styles.featureItem}>
                                                  <FiHome className={styles.featureIcon} />
                                                  <span className={styles.featureText}>
                                                      {isUnlimited ? "Unlimited" : plan.maxListings} Listings
                                                  </span>
                                              </li>
                                              <li className={styles.featureItem}>
                                                  <FiZap className={styles.featureIcon} />
                                                  <span className={styles.featureText}>
                                                      {plan.boostDiscountPercent > 0
                                                          ? `${plan.boostDiscountPercent}% Boost Discount`
                                                          : "No Boost Discount"}
                                                  </span>
                                              </li>
                                              <li className={styles.featureItem}>
                                                  <FiShield className={styles.featureIcon} />
                                                  <span className={styles.featureText}>{plan.support}</span>
                                              </li>
                                          </ul>

                                          {/* CTA Button */}
                                          <Link href={`/subscription/${plan.id}`} className={styles.cardBtn} style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
                                              Get Started
                                          </Link>
                                      </div>
                                  </div>
                              );
                          })}
                </div>

                {/* Compare All Plans Section */}
                <div id="compare-plans-section" className={styles.sectionContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Compare All Plans</h2>
                        <div className={styles.diamondDivider}>
                            <span className={styles.diamondIcon} />
                        </div>
                    </div>

                    <div className={styles.tableOverflow}>
                        <table className={styles.compareTable}>
                            <thead>
                                <tr>
                                    <th>Features</th>
                                    {plans.map((p) => (
                                        <th
                                            key={`th-${p.id}`}
                                            className={p.isFeatured ? styles.thFeatured : ""}
                                        >
                                            {p.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1: Listings */}
                                <tr>
                                    <td className={styles.tdFeatureLabel}>
                                        <FiHome size={15} style={{ color: "var(--primary)" }} />
                                        Listings
                                    </td>
                                    {plans.map((p) => (
                                        <td
                                            key={`listings-${p.id}`}
                                            className={p.isFeatured ? styles.tdFeatured : ""}
                                        >
                                            {p.maxListings === 0 ? "Unlimited" : `${p.maxListings} Listings`}
                                        </td>
                                    ))}
                                </tr>

                                {/* Row 2: Validity */}
                                <tr>
                                    <td className={styles.tdFeatureLabel}>
                                        <FiCalendar size={15} style={{ color: "var(--primary)" }} />
                                        Validity
                                    </td>
                                    {plans.map((p) => (
                                        <td
                                            key={`validity-${p.id}`}
                                            className={p.isFeatured ? styles.tdFeatured : ""}
                                        >
                                            {p.validityDays} Days
                                        </td>
                                    ))}
                                </tr>

                                {/* Row 3: Boost Discount */}
                                <tr>
                                    <td className={styles.tdFeatureLabel}>
                                        <FiZap size={15} style={{ color: "var(--primary)" }} />
                                        Boost Discount
                                    </td>
                                    {plans.map((p) => (
                                        <td
                                            key={`boost-${p.id}`}
                                            className={p.isFeatured ? styles.tdFeatured : ""}
                                        >
                                            {p.boostDiscountPercent > 0
                                                ? `${p.boostDiscountPercent}% Discount`
                                                : "No Discount"}
                                        </td>
                                    ))}
                                </tr>

                                {/* Row 4: Priority Support */}
                                <tr>
                                    <td className={styles.tdFeatureLabel}>
                                        <FiShield size={15} style={{ color: "var(--primary)" }} />
                                        Priority Support
                                    </td>
                                    {plans.map((p) => (
                                        <td
                                            key={`support-${p.id}`}
                                            className={p.isFeatured ? styles.tdFeatured : ""}
                                        >
                                            {p.support === "Priority Support" ? (
                                                <span
                                                    className={`${styles.checkIcon} ${
                                                        p.isFeatured ? styles.checkIconFeatured : ""
                                                    }`}
                                                >
                                                    <FiCheck />
                                                </span>
                                            ) : (
                                                <span className={styles.crossIcon}>
                                                    <FiX />
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Row 5: Agency Features */}
                                <tr>
                                    <td className={styles.tdFeatureLabel}>
                                        <FiLayers size={15} style={{ color: "var(--primary)" }} />
                                        Agency Features
                                    </td>
                                    {plans.map((p) => (
                                        <td
                                            key={`agency-${p.id}`}
                                            className={p.isFeatured ? styles.tdFeatured : ""}
                                        >
                                            {p.agencyFeatures ? (
                                                <span
                                                    className={`${styles.checkIcon} ${
                                                        p.isFeatured ? styles.checkIconFeatured : ""
                                                    }`}
                                                >
                                                    <FiCheck />
                                                </span>
                                            ) : (
                                                <span className={styles.crossIcon}>
                                                    <FiX />
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Why Upgrade Your Plan? Section */}
                <div className={styles.whyUpgradeSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Why Upgrade Your Plan?</h2>
                        <div className={styles.diamondDivider}>
                            <span className={styles.diamondIcon} />
                        </div>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureBox}>
                            <div className={styles.featureBoxIcon}>
                                <FiEye />
                            </div>
                            <h4 className={styles.featureBoxTitle}>Higher Visibility</h4>
                            <p className={styles.featureBoxDesc}>
                                Get your properties seen by more potential buyers with top-tier search placement.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <div className={styles.featureBoxIcon}>
                                <FiTrendingUp />
                            </div>
                            <h4 className={styles.featureBoxTitle}>Priority Listing</h4>
                            <p className={styles.featureBoxDesc}>
                                Show up first in search results and category listings across the portal.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <div className={styles.featureBoxIcon}>
                                <FiDollarSign />
                            </div>
                            <h4 className={styles.featureBoxTitle}>Boost Discounts</h4>
                            <p className={styles.featureBoxDesc}>
                                Save more with exclusive boost pricing discounts of up to 25%.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <div className={styles.featureBoxIcon}>
                                <FiHome />
                            </div>
                            <h4 className={styles.featureBoxTitle}>More Listings</h4>
                            <p className={styles.featureBoxDesc}>
                                List more properties and scale your agency's real estate portfolio effortlessly.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <div className={styles.featureBoxIcon}>
                                <FiAward />
                            </div>
                            <h4 className={styles.featureBoxTitle}>Premium Trust Badge</h4>
                            <p className={styles.featureBoxDesc}>
                                Build instant buyer trust with a verified premium agency badge.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <div className={styles.featureBoxIcon}>
                                <FiHeadphones />
                            </div>
                            <h4 className={styles.featureBoxTitle}>Dedicated Support</h4>
                            <p className={styles.featureBoxDesc}>
                                Get 24/7 dedicated support from our expert real estate advisory team.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Frequently Asked Questions Section */}
                <div className={styles.faqSection}>
                    <div className={styles.sectionHeader} style={{ textAlign: "left", marginBottom: 24 }}>
                        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                    </div>

                    <div className={styles.faqGrid}>
                        {FAQ_ITEMS.map((item, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={`faq-${idx}`}
                                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                                >
                                    <button
                                        type="button"
                                        className={styles.faqQuestionBtn}
                                        onClick={() => toggleFaq(idx)}
                                    >
                                        <span>{item.question}</span>
                                        <FiPlus className={styles.faqPlus} />
                                    </button>
                                    {isOpen && <div className={styles.faqAnswer}>{item.answer}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className={styles.ctaBanner}>
                    <div className={styles.ctaPattern} />
                    <div className={styles.ctaContent}>
                        <h3 className={styles.ctaHeading}>Ready to grow your real estate business?</h3>
                        <p className={styles.ctaSubtext}>
                            Choose the right plan and start reaching more clients today.
                        </p>
                    </div>

                    <button type="button" className={styles.ctaBtn} onClick={scrollToTop}>
                        Choose Your Plan
                        <FiArrowRight size={16} />
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
