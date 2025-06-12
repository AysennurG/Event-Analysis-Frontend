import React, { useState } from "react";
import { Doughnut, Pie, Bar, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js";
import "./Graphs.css";

// Modern ve sade renk paleti
const palette = [
  "#6366F1", // indigo
  "#06B6D4", // cyan
  "#22D3EE", // sky
  "#10B981", // emerald
  "#F59E42", // orange
  "#F43F5E", // rose
  "#A78BFA", // violet
  "#FACC15", // yellow
];

ChartJS.register(
  ArcElement, Tooltip, Legend, Title,
  BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, RadialLinearScale
);

// Modern shadow efekti için Chart.js plugin
const shadowPlugin = {
  id: "custom_shadow",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
  },
  afterDraw: (chart) => {
    chart.ctx.restore();
  }
};

function getDistribution(results, key) {
  const dist = {};
  results.forEach(r => {
    const value = r[key];
    if (value !== undefined && value !== null) {
      dist[value] = (dist[value] || 0) + 1;
    }
  });
  return dist;
}

function getStatsFromResults(results) {
  const crowd_size = results.length;
  const age_distribution = getDistribution(results, "age");
  const gender_distribution = getDistribution(results, "gender");
  const race_distribution = getDistribution(results, "race");
  const emotion_distribution = getDistribution(results, "emotion");
  const memnuniyet = (emotion_distribution["happy"] || 0) + (emotion_distribution["surprise"] || 0);
  const total_faces = Object.values(emotion_distribution).reduce((a, b) => a + b, 0);
  const memnuniyet_orani = total_faces > 0 ? Math.round((memnuniyet / total_faces) * 10000) / 100 : 0;
  return {
    crowd_size,
    age_distribution,
    gender_distribution,
    race_distribution,
    emotion_distribution,
    "memnuniyet_orani_%": memnuniyet_orani
  };
}

function getChartData(distribution, label) {
  return {
    labels: Object.keys(distribution),
    datasets: [
      {
        label,
        data: Object.values(distribution),
        backgroundColor: palette,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 10,
        fill: true,
        pointBackgroundColor: palette,
        pointBorderColor: "#fff",
        tension: 0.45
      },
    ],
  };
}

// Modern ve sade chart seçenekleri
const baseOptions = (label) => ({
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        color: "#222",
        font: { size: 15, weight: "bold", family: "Inter, sans-serif" },
        boxWidth: 18,
        boxHeight: 18,
        padding: 18,
      }
    },
    title: {
      display: true,
      text: label,
      color: "#222",
      font: { size: 18, weight: "bold", family: "Inter, sans-serif" },
      padding: { top: 8, bottom: 18 }
    }
  },
  animation: {
    duration: 1200,
    easing: "easeOutCubic"
  },
  layout: { padding: 0 },
  cutout: "60%",
  responsive: true,
  maintainAspectRatio: false,
});

const barOptions = (label) => ({
  ...baseOptions(label),
  plugins: {
    ...baseOptions(label).plugins,
    legend: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#222", font: { size: 14, family: "Inter, sans-serif" } }
    },
    y: {
      grid: { color: "#eee" },
      ticks: { color: "#222", font: { size: 14, family: "Inter, sans-serif" } },
      beginAtZero: true
    }
  }
});

const lineOptions = (label) => ({
  ...baseOptions(label),
  plugins: {
    ...baseOptions(label).plugins,
    legend: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#222", font: { size: 14, family: "Inter, sans-serif" } }
    },
    y: {
      grid: { color: "#eee" },
      ticks: { color: "#222", font: { size: 14, family: "Inter, sans-serif" } },
      beginAtZero: true
    }
  }
});

const radarOptions = (label) => ({
  ...baseOptions(label),
  plugins: {
    ...baseOptions(label).plugins,
    legend: { display: false }
  },
  scales: {
    r: {
      angleLines: { color: "#eee" },
      grid: { color: "#eee" },
      pointLabels: { color: "#222", font: { size: 14, family: "Inter, sans-serif" } },
      ticks: { color: "#222", font: { size: 12, family: "Inter, sans-serif" }, beginAtZero: true }
    }
  }
});

function AnimatedStat({ label, value, suffix = "", color = "#6366F1" }) {
  return (
    <div style={{
      minWidth: 200,
      margin: "0 28px 28px 0",
      padding: "28px 0 18px 0",
      borderRadius: 18,
      background: "#fff",
      boxShadow: "0 6px 32px #6366F122",
      textAlign: "center",
      border: "2px solid #f3f4f6"
    }}>
      <div style={{ color: "#6366F1", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 44, letterSpacing: 1 }}>
        {value}
        <span style={{ fontSize: 24, marginLeft: 4 }}>{suffix}</span>
      </div>
    </div>
  );
}

const chartTypes = [
  { value: "doughnut", label: "Doughnut" },
  { value: "pie", label: "Pie" },
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "radar", label: "Radar" }
];

function Graphs({ report, results }) {
  const [ageChartType, setAgeChartType] = useState("doughnut");
  const [raceChartType, setRaceChartType] = useState("doughnut");
  const [genderChartType, setGenderChartType] = useState("doughnut");
  const [emotionChartType, setEmotionChartType] = useState("doughnut");

  let stats = report;
  if ((!report || report.crowd_size === 0) && results && results.length > 0) {
    stats = getStatsFromResults(results);
  }
  if (!stats || stats.crowd_size === 0) {
    return <div>Yüz bulunamadı, grafik oluşturulamadı.</div>;
  }

  // Grafik tipine göre uygun ChartJS componentini döndür
  const renderChart = (distribution, label, chartType) => {
    const data = getChartData(distribution, label);
    const chartProps = {
      data,
      height: 240,
      plugins: [shadowPlugin],
    };
    if (chartType === "pie") {
      return <Pie {...chartProps} options={baseOptions(label)} />;
    }
    if (chartType === "bar") {
      return (
        <Bar
          {...chartProps}
          options={barOptions(label)}
          data={{
            labels: data.labels,
            datasets: [{
              label,
              data: data.datasets[0].data,
              backgroundColor: palette,
              borderRadius: 12,
              maxBarThickness: 48
            }]
          }}
        />
      );
    }
    if (chartType === "line") {
      return (
        <Line
          {...chartProps}
          options={lineOptions(label)}
          data={{
            labels: data.labels,
            datasets: [{
              label,
              data: data.datasets[0].data,
              backgroundColor: "rgba(99,102,241,0.15)",
              borderColor: "#6366F1",
              pointBackgroundColor: palette,
              pointBorderColor: "#fff",
              tension: 0.45,
              fill: true
            }]
          }}
        />
      );
    }
    if (chartType === "radar") {
      return (
        <Radar
          {...chartProps}
          options={radarOptions(label)}
          data={{
            labels: data.labels,
            datasets: [{
              label,
              data: data.datasets[0].data,
              backgroundColor: "rgba(99,102,241,0.15)",
              borderColor: "#6366F1",
              pointBackgroundColor: palette,
              pointBorderColor: "#fff",
              fill: true
            }]
          }}
        />
      );
    }
    // Varsayılan: Doughnut
    return <Doughnut {...chartProps} options={baseOptions(label)} />;
  };

  return (
    <div className="graphs" style={{ background: "#f3f4f6", borderRadius: 24, padding: 40 }}>
      <div className="stat-row" style={{ marginBottom: 32 }}>
        <AnimatedStat
          label="Toplam Katılımcı"
          value={stats.crowd_size}
          color="#6366F1"
        />
        <AnimatedStat
          label="Memnuniyet Oranı"
          value={stats["memnuniyet_orani_%"]}
          suffix="%"
          color="#10B981"
        />
      </div>
      <div className="pie-row" style={{ gap: 36 }}>
        <div className="pie-card" style={{ background: "#fff", borderRadius: 22, boxShadow: "0 6px 32px #6366F111", padding: 32, minWidth: 380, minHeight: 420 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select
              value={ageChartType}
              onChange={e => setAgeChartType(e.target.value)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "2px solid #6366F1",
                fontWeight: 700,
                fontSize: 18,
                color: "#6366F1",
                background: "#f3f4f6",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {chartTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {renderChart(stats.age_distribution, "Yaş Dağılımı", ageChartType)}
        </div>
        <div className="pie-card" style={{ background: "#fff", borderRadius: 22, boxShadow: "0 6px 32px #6366F111", padding: 32, minWidth: 380, minHeight: 420 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select
              value={raceChartType}
              onChange={e => setRaceChartType(e.target.value)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "2px solid #6366F1",
                fontWeight: 700,
                fontSize: 18,
                color: "#6366F1",
                background: "#f3f4f6",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {chartTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {renderChart(stats.race_distribution, "Irk Dağılımı", raceChartType)}
        </div>
        <div className="pie-card" style={{ background: "#fff", borderRadius: 22, boxShadow: "0 6px 32px #6366F111", padding: 32, minWidth: 380, minHeight: 420 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select
              value={genderChartType}
              onChange={e => setGenderChartType(e.target.value)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "2px solid #6366F1",
                fontWeight: 700,
                fontSize: 18,
                color: "#6366F1",
                background: "#f3f4f6",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {chartTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {renderChart(stats.gender_distribution, "Cinsiyet Dağılımı", genderChartType)}
        </div>
        <div className="pie-card" style={{ background: "#fff", borderRadius: 22, boxShadow: "0 6px 32px #6366F111", padding: 32, minWidth: 380, minHeight: 420 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select
              value={emotionChartType}
              onChange={e => setEmotionChartType(e.target.value)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "2px solid #6366F1",
                fontWeight: 700,
                fontSize: 18,
                color: "#6366F1",
                background: "#f3f4f6",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {chartTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {renderChart(stats.emotion_distribution, "Duygu Dağılımı", emotionChartType)}
        </div>
      </div>
    </div>
  );
}

export default Graphs;