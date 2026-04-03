/*
 * LEGAL — Academic research prototype: Disclaimer, Privacy Policy, Terms of Use (single tabbed page)
 */
import type { ElementType } from "react";
import { Shield, Lock, FileText, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

type LegalTab = "disclaimer" | "privacy" | "terms";

function tabFromPath(path: string): LegalTab {
  if (path.startsWith("/app/privacy")) return "privacy";
  if (path.startsWith("/app/terms")) return "terms";
  return "disclaimer";
}

const tabs: { id: LegalTab; label: string; href: string; icon: ElementType }[] = [
  { id: "disclaimer", label: "Disclaimer", href: "/app/disclaimer", icon: Shield },
  { id: "privacy", label: "Privacy Policy", href: "/app/privacy", icon: Lock },
  { id: "terms", label: "Terms of Use", href: "/app/terms", icon: FileText },
];

const legalH2 = "text-lg font-bold text-slate-800 mt-8 mb-3 first:mt-0";
const legalP = "text-sm text-slate-600 leading-relaxed mb-4";
const legalUl = "list-disc pl-6 space-y-2 mb-4";
const legalLi = "text-sm text-slate-600";

export default function LegalPages() {
  const [location, setLocation] = useLocation();
  const activeTab = tabFromPath(location);

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <Link href="/app" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-amber-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-6 rounded-xl border border-cyan-500/20 bg-amber-50/60 px-4 py-3 text-center">
          <p className="text-xs font-bold font-display uppercase tracking-wide text-amber-900">
            Academic Research Prototype — For educational use only — Not a commercial compliance product
          </p>
        </div>

        <h1 className="mb-2 text-2xl font-bold font-display tracking-tight text-slate-900">Legal &amp; policies</h1>
        <p className="mb-6 text-sm text-slate-500 font-body">Last updated: March 2026</p>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setLocation(t.href)}
                className={`inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-slate-200 bg-white text-amber-700 shadow-sm"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                } `}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {activeTab === "disclaimer" && <DisclaimerContent />}
          {activeTab === "privacy" && <PrivacyContent />}
          {activeTab === "terms" && <TermsContent />}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 font-body">
          <p>
            &copy; {new Date().getFullYear()} Tatiana Podobivskaia &middot; Miami FL &middot; TradeScreen AI research prototype
          </p>
        </div>
      </div>
    </div>
  );
}

function DisclaimerContent() {
  return (
    <div className="font-body">
      <h2 className={legalH2}>Academic Research Prototype</h2>
      <p className={legalP}>
        TradeScreen AI is an <strong>academic research prototype</strong> developed as academic research. This system
        is intended for educational and research purposes only and is <strong>not a commercial compliance tool</strong>.
      </p>

      <h2 className={legalH2}>No Legal or Compliance Advice</h2>
      <p className={legalP}>
        Information and screening results produced by this prototype do not constitute legal, financial, or compliance
        advice. This system is not a substitute for professional legal or compliance counsel. All outputs should be
        verified by qualified compliance professionals before any business decisions are made.
      </p>

      <h2 className={legalH2}>Accuracy and Completeness</h2>
      <p className={legalP}>
        This prototype draws on publicly available government sanctions databases (OFAC SDN, EU Consolidated, UN
        Security Council, UK OFSI). The researcher makes no warranties as to the accuracy, completeness, or timeliness
        of screening results shown here. Official lists change frequently; there may be delays between updates on source
        sites and what appears in this prototype.
      </p>

      <h2 className={legalH2}>AI-Generated Analysis</h2>
      <p className={legalP}>
        Where AI-assisted analysis is shown, it is for demonstration only and may contain errors, omissions, or
        unsupported assertions. A qualified human analyst must review any material before it is relied upon.
      </p>

      <h2 className={legalH2}>Limitation of Liability</h2>
      <p className={legalP}>
        To the fullest extent permitted by law, the researcher disclaims liability for any
        damages or losses arising from use of this prototype, including reliance on screening outputs or AI-generated
        text.
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="font-body">
      <h2 className={legalH2}>Data Processing</h2>
      <p className={legalP}>
        Privacy is a core design goal for this prototype. Where possible, screening-related data is processed locally in
        the browser.
      </p>

      <h2 className={legalH2}>No Enduring Collection by This Prototype</h2>
      <p className={legalP}>
        This prototype is not intended to store vendor names, screening results, or uploaded documents on external
        servers or to retain them after the session ends. The researcher does not operate this demo as a data
        broker—personal or commercial screening queries should not be treated as confidential submissions to a
        product.
      </p>

      <h2 className={legalH2}>Sanctions Data Sources</h2>
      <p className={legalP}>
        Indexed sanctions data in the prototype reflects publicly available government sources, including:
      </p>
      <ul className={legalUl}>
        <li className={legalLi}>
          <strong>OFAC SDN</strong> — U.S. Department of the Treasury, Office of Foreign Assets Control
        </li>
        <li className={legalLi}>
          <strong>EU Consolidated</strong> — European Union Consolidated Financial Sanctions List
        </li>
        <li className={legalLi}>
          <strong>UN Security Council</strong> — United Nations Security Council Consolidated List
        </li>
        <li className={legalLi}>
          <strong>UK OFSI</strong> — UK Office of Financial Sanctions Implementation
        </li>
      </ul>

      <h2 className={legalH2}>Optional Cloud AI Processing</h2>
      <p className={legalP}>
        If a deployment connects AI analysis to a cloud provider (e.g. Azure OpenAI), query payload and policies would be
        governed by that provider’s terms—not by this overview. This academic build emphasizes local and demo-safe paths.
      </p>

      <h2 className={legalH2}>Browser Storage</h2>
      <p className={legalP}>
        The prototype may use browser storage for preferences (e.g. theme). That data stays on the device unless
        otherwise documented for a specific deployment.
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        For questions about how this research prototype handles information, use the About the Researcher page.
      </p>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="font-body">
      <h2 className={legalH2}>Acceptance</h2>
      <p className={legalP}>
        By using TradeScreen AI, you acknowledge that this is an <strong>academic research prototype</strong> and agree
        to these <strong>Terms of Use</strong> (not a commercial Terms of Service).
      </p>

      <h2 className={legalH2}>Educational Use</h2>
      <p className={legalP}>
        This system is offered for education and research. It is <strong>not</strong> a
        substitute for licensed compliance software. Users must not rely on this prototype alone for real-world
        sanctions determinations.
      </p>

      <h2 className={legalH2}>Permitted Use</h2>
      <p className={legalP}>Appropriate uses of this prototype include:</p>
      <ul className={legalUl}>
        <li className={legalLi}>Academic research and classroom discussion</li>
        <li className={legalLi}>Understanding how screening and transliteration concepts apply in trade finance</li>
        <li className={legalLi}>
          Evaluating AI-assisted compliance <em>methodologies</em> in a non-production setting
        </li>
      </ul>

      <h2 className={legalH2}>Prohibited Use</h2>
      <p className={legalP}>
        Users agree <strong>not</strong> to:
      </p>
      <ul className={legalUl}>
        <li className={legalLi}>Represent this prototype as production-ready commercial screening</li>
        <li className={legalLi}>Base sole business, banking, or legal decisions on outputs from this demo</li>
        <li className={legalLi}>Use this system for any unlawful purpose, including evasion of sanctions</li>
      </ul>

      <h2 className={legalH2}>Intellectual Property</h2>
      <p className={legalP}>
        The TradeScreen AI prototype (design, code, narrative) reflects the researcher&apos;s work. Underlying
        sanctions listings remain the property of their issuing authorities.
      </p>

      <h2 className={legalH2}>Changes</h2>
      <p className={legalP}>
        These Terms of Use may be revised as the research evolves. Continued use after updates constitutes acceptance of
        the revised terms for this prototype context.
      </p>
    </div>
  );
}
