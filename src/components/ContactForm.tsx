import { useState } from "react";

type Category = "bug" | "feature" | "commercial" | "others";
type Status = "idle" | "submitting" | "success";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "bug", label: "バグ報告" },
  { value: "feature", label: "機能要望" },
  { value: "commercial", label: "商用利用に関する相談" },
  { value: "others", label: "その他" },
];

// TODO: Google Form の設定
const FORM_ACTION =
  "https://docs.google.com/forms/d/e/TODO_FORM_ID/formResponse";
const ENTRY = {
  category: "entry.TODO_CATEGORY",
  email: "entry.TODO_EMAIL",
  subject: "entry.TODO_SUBJECT",
  body: "entry.TODO_BODY",
};

const ContactForm = () => {
  const [category, setCategory] = useState<Category>("bug");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData();
    formData.append(ENTRY.category, category);
    formData.append(ENTRY.email, email);
    formData.append(ENTRY.subject, subject);
    formData.append(ENTRY.body, body);

    await fetch(FORM_ACTION, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });
    setStatus("success");
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
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label htmlFor="category" className="label">
          カテゴリ
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="input"
          required
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
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
  );
};

export default ContactForm;
