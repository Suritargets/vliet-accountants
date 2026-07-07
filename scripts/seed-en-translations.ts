/* eslint-disable no-console */
// Populates the English (locale='en') override rows for homepage_content and
// services_content with hand-translated copy (no machine-translation API —
// this is a one-time manual translation of the existing NL defaults).
// Idempotent: re-running overwrites the EN row with this same translation.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { homepageContent, servicesContent } from "../drizzle/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — vul .env.local in en probeer opnieuw.");
  process.exit(1);
}
const db = drizzle(neon(url));

const homepageEn = {
  hero: {
    badge: "Audit · Accountancy · Strategic Advisory",
    titleLead: "Quality in numbers.",
    titleAccent: "Value in every decision.",
    subtitle:
      "Your specialist in audit, accountancy and strategic financial advisory. We combine deep expertise with a proactive approach to manage risk and achieve sustainable growth.",
    ctaPrimary: "Schedule a consultation",
    ctaSecondary: "Our services",
  },
  stats: [
    { value: "15+", label: "Years of experience" },
    { value: "100+", label: "Satisfied clients" },
    { value: "6", label: "Service lines" },
    { value: "100%", label: "Independent" },
  ],
  about: {
    badge: "About us",
    title: "More than numbers: we create financial value",
    paragraphs: [
      "Vliet Accountants & Consultants supports organisations with high-quality audit, accountancy and advisory services. With deep expertise and a proactive approach, we help you manage risk, improve performance and achieve sustainable growth.",
      "Good advice starts with listening. That is why we actively think along with you, identify risks early, and translate insights into concrete, workable solutions.",
    ],
    highlights: [
      "Local expertise combined with international standards",
      "Proactive advisory and a risk-focused approach",
      "Tailored solutions aligned with your organisation",
      "Focus on quality, compliance and sustainable value creation",
    ],
    buttonLabel: "More about us",
  },
  servicesTeaser: {
    badge: "Our services",
    title: "What we can do for you",
    subtitle:
      "A broad range of professional services to support organisations at every stage of their development.",
    readMore: "Read more",
  },
  team: {
    badge: "Our team",
    title: "Experienced professionals, focused on quality and results",
    subtitle:
      "Our team consists of experienced professionals with expertise in audit, accountancy and advisory.",
  },
  cta: {
    title: "Ready to create value for your organisation?",
    text: "We combine quality, insight and experience to support organisations with audit, accountancy and strategic advisory. Schedule a no-obligation conversation and discover what we can do for you.",
    buttonLabel: "Schedule a consultation",
  },
};

const servicesEn: Record<string, unknown> = {
  "accounting-reporting": {
    badge: "Accounting & Reporting",
    title: "Accounting & Reporting",
    subtitle: "Reliable financial information for effective decision-making",
    intro: [
      "Timely, reliable and transparent financial information forms the basis for good governance and successful business operations. Organisations need financial reporting that not only complies with laws and regulations, but also provides valuable insights for strategic and operational decision-making.",
      "Vliet Accountants & Consultants supports organisations with financial reporting, accounting matters and management reporting. We combine technical expertise with practical support to ensure financial information is accurate, relevant and usable.",
      "Our services help organisations improve the quality of financial reporting, comply with reporting requirements and strengthen the finance function.",
    ],
    services: [
      { title: "Annual Financial Statement Preparation", description: "We support organisations in compiling and preparing annual financial statements that comply with applicable regulations and meet stakeholders' information needs." },
      { title: "Financial Reporting", description: "We support organisations in preparing periodic financial reports, management reports and external reporting that provide insight into performance, risks and financial position." },
      { title: "IFRS Advisory & Reporting", description: "We advise and support the application of International Financial Reporting Standards (IFRS), implementation of new standards and complex reporting matters." },
      { title: "Consolidation & Group Reporting", description: "For groups of companies, we provide support with consolidations and group reporting, including setting up efficient reporting processes within the group." },
      { title: "Management Reporting & Dashboards", description: "We support organisations in developing management reports, KPI reports and dashboards that provide insight into performance, trends and risks." },
      { title: "Accounting Advisory Services", description: "We advise organisations on reporting matters, accounting policies, financial processes and the application of relevant reporting standards." },
    ],
    whyUs: [
      "In-depth expertise in financial reporting and accounting",
      "Knowledge of IFRS and other relevant reporting standards",
      "Practical, solution-oriented approach",
      "Support with both local and international reporting matters",
      "Focus on reliability, transparency and quality",
      "Experience across diverse sectors and organisations",
    ],
    ctaTitle: "Ready to strengthen your financial information systems?",
    ctaText: "We help organisations improve financial reporting, management information and reporting processes. Contact us for a no-obligation conversation.",
  },
  "advisory-training": {
    badge: "Advisory & Training",
    title: "Advisory & Training",
    subtitle: "Practical advice and knowledge development for sustainable growth",
    intro: [
      "Successful organisations are characterised by strong decision-making, effective processes and employees with the right knowledge and skills. In a constantly changing environment, organisations need expert advice and targeted development.",
      "Vliet Accountants & Consultants supports organisations with practical advice and professional training in finance, governance, risk management and business operations.",
      "Our services focus on creating sustainable value by supporting organisations in growth, improvement and knowledge development.",
    ],
    services: [
      { title: "Business Advisory", description: "We provide practical, results-oriented advice that supports organisations in making well-considered decisions and achieving their objectives." },
      { title: "Financial Advisory", description: "We support organisations with financial analyses, investment matters, business planning and improving financial performance." },
      { title: "Business Valuations", description: "We perform independent business and share valuations based on recognised valuation methodologies and market insights for investment decisions, mergers and acquisitions." },
      { title: "Process Improvement", description: "We analyse business processes, identify improvement opportunities and support organisations in optimising processes and internal controls." },
      { title: "Corporate Training", description: "We provide practice-oriented training in audit, accountancy, financial reporting, governance, risk management, internal control and compliance." },
      { title: "Leadership & Governance Workshops", description: "Our workshops support directors, supervisory board members and management teams in strengthening their knowledge, responsibilities and decision-making processes." },
    ],
    whyUs: [
      "Combination of technical expertise and practical experience",
      "Practical, results-oriented approach",
      "Tailored solutions aligned with the organisation",
      "Experience within both private and public organisations",
      "Focus on knowledge transfer and sustainable improvement",
      "Support with both strategic and operational matters",
    ],
    ctaTitle: "Ready to further develop your organisation?",
    ctaText: "We help organisations improve performance, strengthen knowledge and achieve sustainable growth. Contact us for a no-obligation conversation.",
  },
  "audit-assurance": {
    badge: "Audit & Assurance",
    title: "Audit & Assurance",
    subtitle: "Independent assurance for trust, transparency and growth",
    intro: [
      "Reliable financial information and effective controls form the basis for good governance, responsible decision-making and stakeholder trust. Organisations face increasing demands for transparency, compliance and accountability.",
      "Vliet Accountants & Consultants delivers high-quality audit and assurance services that support organisations in meeting statutory obligations, managing risk and improving the quality of their financial reporting and internal control.",
      "Through our combination of technical expertise, sector knowledge and practical experience, we help organisations increase transparency, reliability and sustainable value creation.",
    ],
    services: [
      { title: "Audit of Financial Statements", description: "A reliable annual financial statement is essential for shareholders, financiers, regulators and other stakeholders. We perform independent audits in accordance with applicable laws, regulations and reporting standards." },
      { title: "Special Audit Engagements", description: "In addition to regular financial statement audits, we audit specific financial accounts and reports, including subsidy settlements, project accountability reports and contractual reporting." },
      { title: "Agreed-Upon Procedures", description: "Sometimes there is a need to investigate specific matters without issuing an assurance opinion. We perform agreed-upon procedures and report only our factual findings." },
      { title: "Other Assurance Engagements", description: "We provide assurance on financial and non-financial information, processes and controls to support stakeholders, financiers and regulators." },
      { title: "IT Audits", description: "Our IT audits provide insight into the reliability, availability and security of information systems and the effectiveness of IT controls." },
    ],
    whyUs: [
      "Independent and objective services",
      "Risk-based audit methodology",
      "Strong expertise in governance and internal control",
      "Practical recommendations with direct added value",
      "Experience within both private and public organisations",
      "Focus on quality, transparency and trust",
    ],
    ctaTitle: "Ready to further strengthen your organisation?",
    ctaText: "Our audit and assurance services help organisations increase trust, manage risk and strengthen the quality of financial and operational information. Contact us for a no-obligation conversation.",
  },
  "internal-audit-risk-governance": {
    badge: "Internal Audit, Risk & Governance",
    title: "Internal Audit, Risk & Governance",
    subtitle: "Strengthening governance, risk management and internal control",
    intro: [
      "Organisations operate in an increasingly complex environment in which risks, laws and regulations, and stakeholder expectations continue to grow. An effective governance structure, well-functioning risk management and strong internal control are essential for achieving strategic objectives and sustainable growth.",
      "Vliet Accountants & Consultants supports organisations in strengthening their governance, risk management and internal control environment. Through independent assessments, in-depth analyses and practical recommendations, we help organisations identify, manage and monitor risks in a timely manner.",
      "Our services go beyond identifying shortcomings. We focus on creating insight, improving processes and strengthening the control environment.",
    ],
    services: [
      { title: "Internal Audit Services", description: "Internal audits provide independent assurance on the effectiveness of governance, risk management and internal control. We perform operational, financial, compliance and process audits." },
      { title: "Internal Audit Outsourcing & Co-Sourcing", description: "We provide support through outsourcing or co-sourcing of internal audit activities, giving organisations access to experienced audit professionals and specialist expertise." },
      { title: "Enterprise Risk Management (ERM)", description: "We support organisations in identifying, analysing, evaluating and monitoring risks, and in implementing an integrated Enterprise Risk Management framework." },
      { title: "Governance Reviews", description: "Our governance reviews assess the effectiveness of governance structures, decision-making processes, responsibilities and oversight mechanisms." },
      { title: "Internal Control Reviews", description: "We assess the design, existence and operating effectiveness of internal controls and make recommendations to further strengthen the control environment." },
      { title: "Compliance Reviews", description: "We perform independent assessments of compliance processes, internal policies and statutory obligations so organisations gain insight into compliance risks." },
    ],
    whyUs: [
      "Experienced professionals in internal audit, governance and risk management",
      "Independent and objective assessments",
      "Practical recommendations focused on sustainable improvement",
      "Risk-based approach grounded in international best practices",
      "Experience within both private and public organisations",
      "Focus on control, transparency and value creation",
    ],
    ctaTitle: "Ready to further strengthen your organisation?",
    ctaText: "We help organisations improve governance, manage risk and strengthen internal control. Contact us for a no-obligation conversation.",
  },
  "tax-compliance": {
    badge: "Tax & Compliance",
    title: "Tax & Compliance",
    subtitle: "Tax certainty and compliance in a complex environment",
    intro: [
      "Organisations face constantly changing tax legislation, increasing reporting obligations and stricter compliance requirements. Meeting tax obligations on time and managing tax risk are essential for healthy, sustainable business operations.",
      "Vliet Accountants & Consultants supports organisations with tax matters, tax obligations and compliance challenges. We combine technical expertise with a practical, solution-oriented approach.",
      "Our services focus on creating tax certainty, preventing surprises and supporting transparent, compliant business operations.",
    ],
    services: [
      { title: "Corporate Tax Advisory", description: "We advise organisations on a wide range of tax matters and help develop tax-efficient solutions aligned with the organisation's objectives." },
      { title: "Tax Compliance", description: "We support the preparation, review and filing of tax returns and help organisations comply with relevant tax laws and regulations." },
      { title: "Payroll Tax Services", description: "We advise and support organisations on payroll taxes, employment-related tax matters and compliance with employment tax regulations." },
      { title: "Tax Risk Management", description: "We help organisations identify, assess and manage tax risk through reviews, risk analyses and strengthening tax controls." },
      { title: "Tax Reviews & Assessments", description: "Through independent tax reviews, we identify potential risks, points of attention and opportunities for improvement." },
      { title: "Regulatory Compliance", description: "We support organisations in assessing compliance risks, strengthening compliance processes and promoting a culture of compliance and integrity." },
    ],
    whyUs: [
      "Up-to-date knowledge of tax laws and regulations",
      "Practical, solution-oriented advice",
      "Integrated approach to tax, risk and compliance",
      "Focus on managing tax risk",
      "Support with complex tax matters",
      "Independent and professional service",
    ],
    ctaTitle: "Ready to manage tax risk and strengthen compliance?",
    ctaText: "We support organisations with tax matters, tax obligations and compliance challenges. Contact us for a no-obligation conversation.",
  },
  "transformation-project-management": {
    badge: "Transformation & Project Management",
    title: "Transformation & Project Management",
    subtitle: "From strategy to successful execution",
    intro: [
      "Organisations are constantly confronted with change. Digitalisation, new laws and regulations, organisational growth, process improvements and technological developments all call for a structured approach to successfully realise change.",
      "Vliet Accountants & Consultants supports organisations in executing strategic initiatives, change programmes and complex projects. Through effective project management, strong governance and a focus on control, we help organisations achieve their objectives on time, in a controlled manner and sustainably.",
      "Our approach combines project control with risk management, stakeholder management and governance, increasing the likelihood of successful implementation.",
    ],
    services: [
      { title: "Project Management", description: "We support organisations in initiating, planning, executing and monitoring projects to ensure the successful achievement of project objectives." },
      { title: "Programme Management", description: "We support organisations in coordinating, monitoring and controlling programmes to maximise value from strategic investments." },
      { title: "Change Management", description: "We guide organisations in managing organisational change, communication, stakeholder engagement and adoption of new processes and systems." },
      { title: "Project Governance", description: "We support organisations in establishing and assessing governance structures, decision-making processes, roles and responsibilities for projects." },
      { title: "Project Assurance", description: "Our independent project assurance work provides insight into project control. We assess governance, risk management, progress and budget control." },
      { title: "PMO Services", description: "We help organisations set up, strengthen or provide temporary support for PMO functions, including reporting, planning, quality assurance and portfolio management." },
    ],
    whyUs: [
      "Combination of project management, governance and risk management",
      "Independent and objective guidance",
      "Practical approach focused on results and delivery",
      "Experience with complex change and implementation programmes",
      "Strong focus on control, transparency and stakeholder management",
      "Support from strategy through to implementation",
    ],
    ctaTitle: "Ready to successfully deliver your projects and change programmes?",
    ctaText: "We support organisations in delivering strategic initiatives, complex projects and sustainable change. Contact us for a no-obligation conversation.",
  },
  "diensten-index": {
    badge: "Our services",
    title: "A broad range of professional services",
    subtitle: "We offer a broad range of professional services to support organisations at every stage of their development.",
    intro: [],
    services: [
      { title: "Accounting & Reporting", description: "Expert support with financial reporting, annual financial statements, management reporting and complex accounting matters." },
      { title: "Advisory & Training", description: "Practical advice and professional training focused on improving performance, knowledge and decision-making." },
      { title: "Audit & Assurance", description: "Independent audit and assurance services focused on reliable financial reporting, transparency and trust." },
      { title: "Internal Audit, Risk & Governance", description: "Support with governance, risk management and internal control through independent assessments and practical recommendations." },
      { title: "Tax & Compliance", description: "Advice and support on tax, tax obligations and regulatory compliance." },
      { title: "Transformation & Project Management", description: "Guidance for strategic initiatives, change programmes and complex projects with a focus on control, governance and successful implementation." },
    ],
    whyUs: [],
    ctaTitle: "Do you have a question about our services?",
    ctaText: "Contact us for a no-obligation conversation about your challenges and how we can support you.",
  },
};

async function main() {
  await db
    .insert(homepageContent)
    .values({ locale: "en", content: JSON.stringify(homepageEn) })
    .onConflictDoUpdate({
      target: homepageContent.locale,
      set: { content: JSON.stringify(homepageEn), updatedAt: new Date() },
    });
  console.log("homepage_content: EN opgeslagen");

  for (const [serviceKey, content] of Object.entries(servicesEn)) {
    await db
      .insert(servicesContent)
      .values({ serviceKey, locale: "en", content: JSON.stringify(content) })
      .onConflictDoUpdate({
        target: [servicesContent.serviceKey, servicesContent.locale],
        set: { content: JSON.stringify(content), updatedAt: new Date() },
      });
    console.log(`services_content/${serviceKey}: EN opgeslagen`);
  }

  console.log("Klaar.");
}

main().catch((error) => {
  console.error("Vertaling seeden mislukt:", error);
  process.exit(1);
});
