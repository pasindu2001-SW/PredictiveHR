import React, { useRef, useState, useEffect } from "react";
import {
  User,
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  MapPin,
  GraduationCap,
  Heart,
  Building,
  Wifi,
} from "lucide-react";
import Navbar from "../components/Navbar";

const HISTORY_KEY = "attrition_prediction_history_v1";

const Dashboard = () => {
  const initialFormState = {
    age: "",
    gender: "",
    jobRole: "",
    monthlyIncome: "",
    workLifeBalance: "",
    numberOfPromotions: "",
    distanceFromHome: "",
    educationLevel: "",
    maritalStatus: "",
    jobLevel: "",
    companySize: "",
    remoteWork: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [history, setHistory] = useState([]);

  const predictionRef = useRef(null);

  useEffect(() => {
    // load history from localStorage
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (err) {
      console.error("error", err);
    }
  }, []);

  useEffect(() => {
    // persist history
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = typeof value === "string" ? value.trim() : value;
    setFormData((p) => ({ ...p, [name]: val }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    const ageNum = Number(formData.age);
    const incomeNum = Number(formData.monthlyIncome);
    const promoNum = Number(formData.numberOfPromotions);
    const distNum = Number(formData.distanceFromHome);

    if (!formData.age || isNaN(ageNum) || ageNum < 18 || ageNum > 70)
      errors.age = "Age must be a number between 18 and 70";
    if (!formData.gender) errors.gender = "Please select gender";
    if (!formData.jobRole) errors.jobRole = "Please select job role";
    if (!formData.monthlyIncome || isNaN(incomeNum) || incomeNum < 1000)
      errors.monthlyIncome = "Minimum income is $1000";
    if (!formData.workLifeBalance)
      errors.workLifeBalance = "Select work-life balance";
    if (formData.numberOfPromotions === "" || isNaN(promoNum) || promoNum < 0)
      errors.numberOfPromotions = "Promotions must be 0 or more";
    if (formData.distanceFromHome === "" || isNaN(distNum) || distNum < 0)
      errors.distanceFromHome = "Distance must be 0 or more";
    if (!formData.educationLevel)
      errors.educationLevel = "Please select education level";
    if (!formData.maritalStatus)
      errors.maritalStatus = "Please select marital status";
    if (!formData.jobLevel) errors.jobLevel = "Please select job level";
    if (!formData.companySize)
      errors.companySize = "Please select company size";
    if (!formData.remoteWork)
      errors.remoteWork = "Please select remote work option";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const normalizeOption = (value) => {
    if (typeof value !== "string") return value;
    if (value.toLowerCase().includes("bachelor")) return "Bachelor's Degree";
    if (value.toLowerCase().includes("master")) return "Master's Degree";
    if (value.toLowerCase().includes("associate")) return "Associate Degree";
    if (value.toLowerCase().includes("phd")) return "PhD";
    return value
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const payload = {
      age: Number(formData.age),
      gender: normalizeOption(formData.gender),
      jobRole: normalizeOption(formData.jobRole),
      monthlyIncome: Number(formData.monthlyIncome),
      workLifeBalance: normalizeOption(formData.workLifeBalance),
      numberOfPromotions: Number(formData.numberOfPromotions),
      distanceFromHome: Number(formData.distanceFromHome),
      educationLevel: normalizeOption(formData.educationLevel),
      maritalStatus: normalizeOption(formData.maritalStatus),
      jobLevel: normalizeOption(formData.jobLevel),
      companySize: normalizeOption(formData.companySize),
      remoteWork: normalizeOption(formData.remoteWork),
    };

    try {
      const resp = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.detail || "Server error");
        setPrediction(null);
        setProbability(null);
      } else {
        setPrediction(data.prediction);
        setProbability(data.probability ?? null);

        // push to history
        const entry = {
          ts: new Date().toISOString(),
          input: payload,
          prediction: data.prediction,
          probability: data.probability,
        };
        setHistory((h) => [entry, ...h].slice(0, 10));

        setError(null);
        setTimeout(
          () => predictionRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }
    } catch (err) {
      setError("Network error — check the backend and CORS settings.", err);
      setPrediction(null);
      setProbability(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setPrediction(null);
    setProbability(null);
    setError(null);
    setFormErrors({});
  };

  const formFields = [
    { name: "age", label: "Age", icon: User, type: "number" },
    {
      name: "gender",
      label: "Gender",
      icon: User,
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    {
      name: "jobRole",
      label: "Job Role",
      icon: Briefcase,
      type: "select",
      options: ["Education", "Finance", "Healthcare", "Media", "Technology"],
    },
    {
      name: "monthlyIncome",
      label: "Monthly Income ($)",
      icon: DollarSign,
      type: "number",
    },
    {
      name: "workLifeBalance",
      label: "Work-Life Balance",
      icon: Clock,
      type: "select",
      options: ["Poor", "Fair", "Good", "Excellent"],
    },
    {
      name: "numberOfPromotions",
      label: "Number of Promotions",
      icon: TrendingUp,
      type: "number",
    },
    {
      name: "distanceFromHome",
      label: "Distance from Home (km)",
      icon: MapPin,
      type: "number",
    },
    {
      name: "educationLevel",
      label: "Education Level",
      icon: GraduationCap,
      type: "select",
      options: [
        "Associate Degree",
        "High School",
        "Bachelor's Degree",
        "Master's Degree",
        "PhD",
      ],
    },
    {
      name: "maritalStatus",
      label: "Marital Status",
      icon: Heart,
      type: "select",
      options: ["Single", "Married", "Divorced"],
    },
    {
      name: "jobLevel",
      label: "Job Level",
      icon: Briefcase,
      type: "select",
      options: ["Entry", "Mid", "Senior", "Executive"],
    },
    {
      name: "companySize",
      label: "Company Size",
      icon: Building,
      type: "select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "remoteWork",
      label: "Remote Work",
      icon: Wifi,
      type: "select",
      options: ["Yes", "No"],
    },
  ];

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Employee Attrition Prediction
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {formFields.map(({ name, label, icon: Icon, type, options }) => (
            <div key={name} className="flex flex-col">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Icon className="w-4 h-4 text-blue-600 mr-2" />
                {label}
              </label>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors[name] ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select {label}</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors[name] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={`Enter ${label}`}
                />
              )}
              {formErrors[name] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[name]}</p>
              )}
            </div>
          ))}

          <div className="md:col-span-2 flex justify-between gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-blue-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium py-2 px-4 rounded-lg transition-all`}
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all"
            >
              Reset
            </button>
          </div>
        </form>

        <div ref={predictionRef}>
          {prediction !== null && (
            <div
              className={`mt-8 mx-auto w-full p-6 rounded-xl shadow-lg border-l-4 ${
                prediction === 0
                  ? "border-red-600 bg-red-50"
                  : "border-green-600 bg-green-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-lg font-bold ${
                    prediction === 0 ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {prediction === 0
                    ? "Attrition Risk Detected"
                    : "No Attrition Risk"}
                </h2>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 ${
                      prediction === 0 ? "bg-red-600" : "bg-green-600"
                    }`}
                    style={{
                      width: `${
                        probability !== null
                          ? ((probability) * 100).toFixed(2)
                          : 0
                      }%`,
                      transition: "width 400ms ease",
                    }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {probability !== null
                    ? `${((probability) * 100).toFixed(2)}%`
                    : "N/A"}
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                {prediction === 0
                  ? "This employee may be at risk of attrition. Consider preventative action."
                  : "This employee shows no current signs of attrition risk."}
              </p>
            </div>
          )}

          {error && (
            <p className="mt-6 text-center text-red-600 font-medium">{error}</p>
          )}
        </div>

        {/* Simple history */}
        {history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Recent Predictions</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>

            <div className="grid gap-3">
              {history.map((h) => (
                <div key={h.ts} className="p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500">
                    {new Date(h.ts).toLocaleString()}
                  </div>
                  <div className="text-sm mt-1">
                    Prediction:{" "}
                    <strong
                      className={
                        h.prediction === 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {h.prediction === 0 ? "Attrition" : "No Attrition"}
                    </strong>{" "}
                    —{" "}
                    {h.probability !== null
                      ? `${((h.probability) * 100).toFixed(2)}%`
                      : "N/A"}
                  </div>
                  <details className="mt-2 text-xs text-gray-600">
                    <summary className="cursor-pointer">View input</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(h.input, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
