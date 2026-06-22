import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, ImagePlus, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage, imageUrl } from "../api/client.js";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { categories } from "../utils/constants.js";

const blankForm = {
  type: "lost",
  title: "",
  category: "",
  location: "",
  incidentDate: new Date().toISOString().slice(0, 10),
  description: "",
  contactPhone: ""
};

export default function ItemFormPage({ edit = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState(blankForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!edit) return;
    api
      .get(`/items/${id}`)
      .then(({ data }) => {
        const item = data.item;
        const ownerId = item.createdBy?._id || item.createdBy;
        if (ownerId !== user.id && user.role !== "admin") {
          navigate("/dashboard", { replace: true });
          return;
        }
        setForm({
          type: item.type,
          title: item.title,
          category: item.category,
          location: item.location,
          incidentDate: item.incidentDate.slice(0, 10),
          description: item.description,
          contactPhone: item.contactPhone || ""
        });
        if (item.image) setPreview(imageUrl(item.image));
      })
      .catch((requestError) => setError(errorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [edit, id, navigate, user]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) payload.append("image", image);

    try {
      const { data } = edit
        ? await api.put(`/items/${id}`, payload)
        : await api.post("/items", payload);
      showToast(edit ? "Report updated" : "Your report is now live");
      navigate(`/items/${data.item._id}`);
    } catch (requestError) {
      setError(errorMessage(requestError));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading report" />;

  return (
    <section className="page-section form-page">
      <div className="narrow-container">
        <Link className="back-link" to={edit ? `/items/${id}` : "/dashboard"}><ArrowLeft size={16} /> Go back</Link>
        <div className="form-heading">
          <span className="eyebrow">{edit ? "Update report" : "Create a report"}</span>
          <h1>{edit ? "Keep the details current" : "What would you like to report?"}</h1>
          <p>Clear, specific details give an item its best chance of getting home.</p>
        </div>
        {error && <div className="form-error">{error}</div>}
        <form className="report-form" onSubmit={submit}>
          <fieldset className="form-card">
            <legend>1. Report type</legend>
            <p>Did you lose this item or find it?</p>
            <div className="type-select">
              <label className={form.type === "lost" ? "selected lost-select" : ""}>
                <input type="radio" name="type" value="lost" checked={form.type === "lost"} onChange={change} />
                <span>?</span><strong>I lost something</strong><small>Help me look for it</small>
              </label>
              <label className={form.type === "found" ? "selected found-select" : ""}>
                <input type="radio" name="type" value="found" checked={form.type === "found"} onChange={change} />
                <span>✓</span><strong>I found something</strong><small>Help me return it</small>
              </label>
            </div>
          </fieldset>

          <fieldset className="form-card">
            <legend>2. Item details</legend>
            <p>Tell people what to look for.</p>
            <div className="form-grid">
              <label className="field-label full-field">
                Item name
                <input required minLength="2" maxLength="100" name="title" value={form.title} onChange={change} placeholder="e.g. Black leather wallet" />
              </label>
              <label className="field-label">
                Category
                <select required name="category" value={form.category} onChange={change}>
                  <option value="">Choose category</option>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="field-label">
                Date {form.type}
                <input required type="date" max={new Date().toISOString().slice(0, 10)} name="incidentDate" value={form.incidentDate} onChange={change} />
              </label>
              <label className="field-label full-field">
                Campus location
                <input required maxLength="120" name="location" value={form.location} onChange={change} placeholder="e.g. Second floor, Main Library" />
              </label>
              <label className="field-label full-field">
                Description
                <textarea required minLength="10" maxLength="1500" rows="6" name="description" value={form.description} onChange={change} placeholder="Color, brand, distinctive marks, and where you last saw or found it…" />
                <small className="character-count">{form.description.length}/1500</small>
              </label>
            </div>
          </fieldset>

          <fieldset className="form-card">
            <legend>3. Add a photo</legend>
            <p>A photo makes matching the right item much easier. Optional, but recommended.</p>
            <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} />
            {preview ? (
              <div className="image-preview">
                <img src={preview} alt="Selected item preview" />
                <button type="button" onClick={() => { setImage(null); setPreview(""); fileRef.current.value = ""; }}><X size={16} /> Remove</button>
              </div>
            ) : (
              <button className="upload-zone" type="button" onClick={() => fileRef.current?.click()}>
                <span><ImagePlus size={26} /></span>
                <strong>Choose an item photo</strong>
                <small>JPG, PNG, WEBP, or GIF — max 5 MB</small>
              </button>
            )}
          </fieldset>

          <fieldset className="form-card">
            <legend>4. Contact</legend>
            <p>Your account email will be shown on the report. A phone number is optional.</p>
            <label className="field-label">
              Phone number
              <input maxLength="30" name="contactPhone" value={form.contactPhone} onChange={change} placeholder="+1 555 000 0000" />
            </label>
          </fieldset>

          <div className="form-submit">
            <p>By publishing, you agree to share these report details with the campus community.</p>
            <button className="button button-primary button-large" disabled={saving} type="submit">
              <Camera size={18} /> {saving ? "Publishing…" : edit ? "Save changes" : "Publish report"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

