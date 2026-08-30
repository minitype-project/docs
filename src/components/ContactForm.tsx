import { useRef, useState } from "react";

type Status = "idle" | "submitting" | "success";

const CATEGORIES = [
  "バグ報告",
  "機能要望",
  "商用利用に関する相談",
  "その他",
] as const;
type Category = (typeof CATEGORIES)[number];

const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSfE8GGiAtLscJWmM_x71CqHXWhLSvAq9caySWga9UuINbEwlg/formResponse";
const ENTRY = {
  category: "entry.825580270",
  email: "entry.1758696703",
  subject: "entry.1258262730",
  body: "entry.942462814",
};

const IFRAME_NAME = "google-form-target";

const ContactForm = () => {
  const [category, setCategory] = useState<Category>("バグ報告");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    formRef.current?.submit();
    setTimeout(() => setStatus("success"), 1000);
  };

  if (status === "success") {
    return (
      <div className="success">
        <p className="success-title">送信しました</p>
        <p className="success-desc">
          お問い合わせいただきありがとうございます．内容を確認の上，ご連絡いたします．
        </p>
      </div>
    );
  }

  return (
    <>
      <iframe
        name={IFRAME_NAME}
        style={{ display: "none" }}
        title="form-target"
      />
      <form
        ref={formRef}
        action={FORM_ACTION}
        method="POST"
        target={IFRAME_NAME}
        onSubmit={handleSubmit}
        className="form"
      >
        <div className="field">
          <label htmlFor="category" className="label">
            カテゴリ
          </label>
          <select
            id="category"
            name={ENTRY.category}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="input"
            required
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="email" className="label">
            メールアドレス
          </label>
          <input
            id="email"
            name={ENTRY.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="your@example.com"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="subject" className="label">
            件名
          </label>
          <input
            id="subject"
            name={ENTRY.subject}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
            placeholder="件名をご入力ください"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="body" className="label">
            本文
          </label>
          <textarea
            id="body"
            name={ENTRY.body}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input textarea"
            placeholder="お問い合わせ内容をご入力ください"
            rows={8}
            required
          />
        </div>

        <button
          type="submit"
          className="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "送信中……" : "送信する"}
        </button>
      </form>
    </>
  );
};

export default ContactForm;
