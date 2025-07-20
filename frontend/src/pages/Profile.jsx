import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const photoInputRef = useRef();
  const resumeInputRef = useRef();

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setEditName(res.data.user.name || "");
      setEditEmail(res.data.user.email || "");
      setResumeName(res.data.user.resume ? res.data.user.resume.split("/").pop() : "");
    } catch (err) {
      alert("Not logged in or session expired.");
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  if (!token) {
    return <div style={{marginTop: 40, fontSize: '1.2rem'}}>Please <b>log in</b> to view your profile.</div>;
  }

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/profile/edit",
        { name: editName, email: editEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      alert("Profile updated!");
      fetchProfile();
    } catch {
      alert("Update failed");
    }
    setLoading(false);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("photo", file);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/profile/photo", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      alert("Profile photo updated!");
    } catch {
      alert("Photo upload failed");
    }
    setLoading(false);
  };

  const handleResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeName(file.name);
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/profile/resume", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      alert("Resume uploaded!");
    } catch {
      alert("Resume upload failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Profile</h2>
      {user && (
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 32, marginBottom: 32}}>
          {/* Profile Photo */}
          <div>
            <img
              src={photoPreview || (user.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : "https://via.placeholder.com/100")}
              alt="Profile"
              style={{width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2'}}
            />
            <div style={{marginTop: 8}}>
              <input
                type="file"
                accept="image/*"
                style={{display: 'none'}}
                ref={photoInputRef}
                onChange={handlePhoto}
              />
              <button onClick={() => photoInputRef.current.click()} style={{marginTop: 4}}>Change Photo</button>
            </div>
          </div>
          {/* Info and Edit */}
          <div style={{flex: 1}}>
            <form onSubmit={handleEdit} style={{marginBottom: 18}}>
              <div style={{marginBottom: 10}}>
                <label>Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #bbb'}}
                />
              </div>
              <div style={{marginBottom: 10}}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  style={{marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #bbb'}}
                />
              </div>
              <button type="submit" disabled={loading}>Save</button>
            </form>
            {/* Resume Upload */}
            <div style={{marginBottom: 10}}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{display: 'none'}}
                ref={resumeInputRef}
                onChange={handleResume}
              />
              <button onClick={() => resumeInputRef.current.click()} style={{marginRight: 8}}>Upload Resume</button>
              {user.resume && (
                <a href={`http://localhost:5000${user.resume}`} target="_blank" rel="noopener noreferrer" style={{color: '#1976d2', textDecoration: 'underline'}}>
                  {resumeName || "View Resume"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
