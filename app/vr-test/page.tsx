"use client";

import { useState, useEffect, useRef } from "react";
import { complexData, VRComplex, getVRUrl } from "@/lib/vrData";
import StoreBanner from "@/components/home/StoreBanner";
import { VR_AREA_MAP } from "@/lib/vrAreaMapping";
import { Building2, ChevronLeft } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type ColorDef = { bg: string; border: string; text: string };

// ── 단지별 타입 색상 (단지별 설정 우선, 없으면 공통 fallback) ──
const COMPLEX_TYPE_COLOR: Record<string, Record<string, ColorDef>> = {
  ocean_doosan: {},
  ocean_hansin: {
    "29a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "29b": { bg: "#d6eaf8", border: "#a9cce3", text: "#333" },
    "33a": { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "33b": { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "33c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "33d": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "33e": { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
  },
  ocean_kukdong: {},
  ocean_lotte: {
    "38":  { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "46b": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "54":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
  },
  ocean_qweendom_edison: {
    "33a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "33b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34a": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "34b": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "39a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "39b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "39c": { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "46c": { bg: "#fde68a", border: "#f59e0b", text: "#333" },
    "55":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "87":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  ocean_qweendom_lincoln: {
    "33a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "33b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34a": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "34b": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "39a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "39b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "39c": { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "46c": { bg: "#fde68a", border: "#f59e0b", text: "#333" },
    "55":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "87":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  ocean_qweendom_einstein: {
    "33a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "33b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34a": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "34b": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "39a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "39b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "39c": { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "46c": { bg: "#fde68a", border: "#f59e0b", text: "#333" },
    "55":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "87":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  ocean_samjung: {
    "28":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "31":  { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
    "34a": { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "34b": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "39":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  },
  ocean_solmare: {
    "36a": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "36b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "39":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "42":  { bg: "#fde68a", border: "#f59e0b", text: "#333" },
  },
  ocean_blueocean4: {
    "46a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "46b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "54a": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "54b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "65":  { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "66":  { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "69b": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "76":  { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "78":  { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "79":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "88b": { bg: "#fde68a", border: "#f59e0b", text: "#333" },
  },
  ocean_blueocean5: {
    "46a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "46b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "54a": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "54b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "64":  { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
    "65":  { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "66":  { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "68a": { bg: "#d6eaf8", border: "#a9cce3", text: "#333" },
    "69b": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "76":  { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "77":  { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "78":  { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "79":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "88b": { bg: "#fde68a", border: "#f59e0b", text: "#333" },
  },
  ocean_blueocean6: {
    "46a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "46b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "54a": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "54b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "64":  { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
    "65":  { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "66":  { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "68a": { bg: "#d6eaf8", border: "#a9cce3", text: "#333" },
    "69b": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "76":  { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "77":  { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "78":  { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "79":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "88b": { bg: "#fde68a", border: "#f59e0b", text: "#333" },
  },
};

// ── 공통 fallback 색상 ──
const TYPE_COLOR: Record<string, ColorDef> = {
  // 28평대
  "28":  { bg: "#d946a8", border: "#b0308a", text: "#fff" },
  "29":  { bg: "#e879b0", border: "#c0508a", text: "#fff" },
  "29a": { bg: "#e879b0", border: "#c0508a", text: "#fff" },
  "29b": { bg: "#f0a0cc", border: "#d070a0", text: "#333" },
  // 31-32평대
  "31":  { bg: "#ff6b6b", border: "#cc4444", text: "#fff" },
  "32":  { bg: "#ff9494", border: "#dd6060", text: "#fff" },
  // 33평대
  "33a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
  "33b": { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "33c": { bg: "#1ec8c8", border: "#0aa0a0", text: "#fff" },
  "33d": { bg: "#4a9eff", border: "#2070cc", text: "#fff" },
  "33e": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  // 34평대
  "34a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
  "34b": { bg: "#ffc04a", border: "#e89000", text: "#333" },
  "34c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  // 36평대
  "36":  { bg: "#27ae60", border: "#1e8449", text: "#fff" },
  "36a": { bg: "#52d98a", border: "#28a85a", text: "#333" },
  "36b": { bg: "#82e8a8", border: "#48c070", text: "#333" },
  // 38평대
  "38":  { bg: "#e74c3c", border: "#c0392b", text: "#fff" },
  // 39평대
  "39":  { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "39a": { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "39b": { bg: "#1abc9c", border: "#148f77", text: "#fff" },
  "39c": { bg: "#4a9eff", border: "#2070cc", text: "#fff" },
  "39d": { bg: "#3498db", border: "#2176ae", text: "#fff" },
  // 42-43평대
  "42":  { bg: "#16a085", border: "#117a65", text: "#fff" },
  "43":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  // 46평대
  "46a": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
  "46b": { bg: "#5dade2", border: "#2e86c1", text: "#fff" },
  "46c": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
  // 49평대
  "49":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  // 54-55평대
  "54":  { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
  "54a": { bg: "#a569bd", border: "#7d3c98", text: "#fff" },
  "54b": { bg: "#c39bd3", border: "#9b59b6", text: "#333" },
  "55":  { bg: "#e67e22", border: "#ca6f1e", text: "#fff" },
  // 59평대
  "59":  { bg: "#a855f7", border: "#7c3aed", text: "#fff" },
  // 64-69평대
  "64":  { bg: "#17a589", border: "#0e7863", text: "#fff" },
  "65":  { bg: "#d4ac0d", border: "#a08000", text: "#fff" },
  "66":  { bg: "#f39c12", border: "#c87d0e", text: "#fff" },
  "67a": { bg: "#ca6f1e", border: "#a04000", text: "#fff" },
  "68a": { bg: "#dc7633", border: "#b8500a", text: "#fff" },
  "69b": { bg: "#f0a500", border: "#cc8800", text: "#333" },
  // 76-79평대
  "76":  { bg: "#c0392b", border: "#922b21", text: "#fff" },
  "77":  { bg: "#e74c3c", border: "#c0392b", text: "#fff" },
  "78":  { bg: "#922b21", border: "#6e2020", text: "#fff" },
  "79":  { bg: "#d98880", border: "#a93226", text: "#fff" },
  // 85평대
  "85":  { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
  // 87-88평대
  "87":  { bg: "#7f8c8d", border: "#616a6b", text: "#fff" },
  "87a": { bg: "#95a5a6", border: "#717d7e", text: "#333" },
  "87b": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
  "88a": { bg: "#566573", border: "#3d4f5c", text: "#fff" },
  "88b": { bg: "#717d7e", border: "#5d6d7e", text: "#fff" },
};
function typeColor(complexKey: string, type: string): ColorDef {
  return COMPLEX_TYPE_COLOR[complexKey]?.[type] ?? TYPE_COLOR[type] ?? { bg: "#888", border: "#555", text: "#fff" };
}

// ── 단지별 배치도 최대 너비 / 세로형 여부 ──
const COMPLEX_MAX_WIDTH: Record<string, string> = {
  ocean_samjung: "max-w-sm",
  ocean_solmare: "max-w-lg",
};

// ── 배치도 + 핫스팟 데이터 ──
type Hotspot = { id: number; type: string; x: number; y: number };

const FLOOR_PLAN_DATA: Record<string, { image: string; hotspots: Hotspot[] }> = {
  ocean_doosan: {
    image: "/apt_map/ocean/doosan.jpg",
    hotspots: [
      { id: 100, type: "49", x: 8, y: 9.9 },
      { id: 101, type: "49", x: 8.1, y: 34.4 },
      { id: 102, type: "49", x: 8.3, y: 59.9 },
      { id: 103, type: "33c", x: 13.8, y: 10.4 },
      { id: 104, type: "33c", x: 13.7, y: 35.1 },
      { id: 105, type: "33c", x: 13.6, y: 60.6 },
      { id: 106, type: "33c", x: 50.6, y: 9.5 },
      { id: 107, type: "33c", x: 56.7, y: 12.3 },
      { id: 108, type: "33c", x: 75, y: 10.2 },
      { id: 109, type: "33c", x: 81, y: 10.3 },
      { id: 110, type: "33c", x: 74.8, y: 35.4 },
      { id: 111, type: "33c", x: 80.7, y: 35.2 },
      { id: 112, type: "33c", x: 74.9, y: 60.1 },
      { id: 113, type: "33c", x: 81.2, y: 59.8 },
      { id: 114, type: "33b", x: 27.5, y: 11.3 },
      { id: 115, type: "33b", x: 36.5, y: 10.9 },
      { id: 116, type: "33b", x: 44.1, y: 10.9 },
      { id: 117, type: "33b", x: 66.1, y: 11.8 },
      { id: 118, type: "33b", x: 94, y: 11.2 },
      { id: 119, type: "33b", x: 94.2, y: 36.1 },
      { id: 120, type: "33b", x: 65.9, y: 37.1 },
      { id: 121, type: "33b", x: 44, y: 35.7 },
      { id: 122, type: "33b", x: 36.8, y: 35.8 },
      { id: 123, type: "33b", x: 27.7, y: 36.2 },
      { id: 124, type: "33b", x: 27.7, y: 61.5 },
      { id: 125, type: "33b", x: 36.6, y: 61.4 },
      { id: 126, type: "33b", x: 44.2, y: 60.9 },
      { id: 127, type: "33b", x: 55.6, y: 61.6 },
      { id: 128, type: "33b", x: 94.2, y: 60.9 },
      { id: 129, type: "33a", x: 21.6, y: 18.8 },
      { id: 130, type: "33a", x: 26.1, y: 18.1 },
      { id: 131, type: "33a", x: 38.5, y: 17.6 },
      { id: 132, type: "33a", x: 42.9, y: 17.1 },
      { id: 133, type: "33a", x: 59.7, y: 18.1 },
      { id: 134, type: "33a", x: 64.8, y: 18.1 },
      { id: 135, type: "33a", x: 87.6, y: 17.7 },
      { id: 136, type: "33a", x: 92.8, y: 17.4 },
      { id: 137, type: "33a", x: 87.6, y: 42.1 },
      { id: 138, type: "33a", x: 92.6, y: 42.2 },
      { id: 139, type: "33a", x: 64.8, y: 43.4 },
      { id: 140, type: "33a", x: 59.6, y: 43.3 },
      { id: 141, type: "33a", x: 43.2, y: 42.2 },
      { id: 142, type: "33a", x: 38.5, y: 42.4 },
      { id: 143, type: "33a", x: 26.6, y: 42.4 },
      { id: 144, type: "33a", x: 22.1, y: 42.8 },
      { id: 145, type: "33a", x: 92.9, y: 67.3 },
      { id: 146, type: "33a", x: 87.7, y: 67 },
      { id: 147, type: "33a", x: 61.9, y: 68.1 },
      { id: 148, type: "33a", x: 56.8, y: 68.4 },
      { id: 149, type: "33a", x: 43.2, y: 67.5 },
      { id: 150, type: "33a", x: 38.6, y: 67.7 },
      { id: 151, type: "33a", x: 26.7, y: 68.1 },
      { id: 152, type: "33a", x: 22, y: 68.4 },
      { id: 153, type: "33c", x: 50.8, y: 34.9 },
      { id: 154, type: "33c", x: 57, y: 37.8 },
      { id: 155, type: "33c", x: 80.9, y: 84.7 },
      { id: 156, type: "33c", x: 74.9, y: 85 },
      { id: 157, type: "28", x: 84.9, y: 11.6 },
      { id: 158, type: "28", x: 84.9, y: 36.5 },
      { id: 159, type: "28", x: 85, y: 61.7 },
      { id: 160, type: "28", x: 66.1, y: 58.2 },
      { id: 161, type: "28", x: 63.2, y: 61.9 },
      { id: 162, type: "28", x: 55.1, y: 82.5 },
      { id: 163, type: "28", x: 58, y: 86.1 },
      { id: 164, type: "28", x: 85.1, y: 86.9 },
      { id: 165, type: "33d", x: 18.8, y: 11.9 },
      { id: 166, type: "33d", x: 18.8, y: 36.3 },
      { id: 167, type: "33d", x: 18.8, y: 61.7 },
      { id: 168, type: "33d", x: 18.9, y: 86.9 },
      { id: 169, type: "49", x: 8.5, y: 84.4 },
      { id: 170, type: "33c", x: 13.7, y: 85.3 },
      { id: 171, type: "33a", x: 22, y: 93.4 },
      { id: 172, type: "33a", x: 26.9, y: 93.1 },
      { id: 173, type: "33a", x: 38.9, y: 92.6 },
      { id: 174, type: "33a", x: 43.5, y: 92.6 },
      { id: 175, type: "33a", x: 59.6, y: 92 },
      { id: 176, type: "33a", x: 64.6, y: 91.8 },
      { id: 177, type: "33a", x: 87.7, y: 92.2 },
      { id: 178, type: "33a", x: 93, y: 92.1 },
      { id: 179, type: "33b", x: 28, y: 86.4 },
      { id: 180, type: "33b", x: 36.9, y: 86.3 },
      { id: 181, type: "33b", x: 44.4, y: 85.9 },
      { id: 182, type: "33b", x: 66.1, y: 86.1 },
      { id: 183, type: "33b", x: 94.4, y: 86 },
    ],
  },
  ocean_hansin: {
    image: "/apt_map/ocean/hansin.jpg",
    hotspots: [
      { id: 0, type: "29b", x: 6.4, y: 10.4 },
      { id: 1, type: "29b", x: 13.6, y: 10.3 },
      { id: 2, type: "29b", x: 23.9, y: 10.1 },
      { id: 3, type: "29b", x: 31.3, y: 10 },
      { id: 4, type: "29b", x: 31.5, y: 29.4 },
      { id: 5, type: "29b", x: 24.4, y: 29.2 },
      { id: 6, type: "29b", x: 13.6, y: 29 },
      { id: 7, type: "29b", x: 6.4, y: 29.1 },
      { id: 8, type: "29b", x: 42.1, y: 10.1 },
      { id: 9, type: "29b", x: 49.5, y: 10.1 },
      { id: 10, type: "29b", x: 49.2, y: 29.1 },
      { id: 11, type: "29b", x: 42.3, y: 29.1 },
      { id: 12, type: "33d", x: 5.3, y: 14.9 },
      { id: 13, type: "33d", x: 14.1, y: 15.3 },
      { id: 14, type: "33d", x: 23.1, y: 14.5 },
      { id: 15, type: "33d", x: 32, y: 14.7 },
      { id: 16, type: "33d", x: 41.2, y: 15.1 },
      { id: 17, type: "33d", x: 50.2, y: 14.9 },
      { id: 18, type: "33d", x: 50.4, y: 33.1 },
      { id: 19, type: "33d", x: 41.7, y: 33.1 },
      { id: 20, type: "33d", x: 23.4, y: 33.9 },
      { id: 21, type: "33d", x: 14.2, y: 34 },
      { id: 22, type: "33d", x: 5.5, y: 33.9 },
      { id: 23, type: "33e", x: 8.2, y: 18.6 },
      { id: 24, type: "33e", x: 11.5, y: 18.5 },
      { id: 25, type: "33e", x: 25.9, y: 18.7 },
      { id: 26, type: "33e", x: 29.1, y: 18.8 },
      { id: 27, type: "33e", x: 43.8, y: 18.7 },
      { id: 28, type: "33e", x: 47.3, y: 18.6 },
      { id: 29, type: "33e", x: 47.7, y: 37 },
      { id: 30, type: "33e", x: 43.9, y: 37.1 },
      { id: 31, type: "33e", x: 29.5, y: 37.7 },
      { id: 32, type: "33e", x: 26.1, y: 37.5 },
      { id: 33, type: "33e", x: 11.4, y: 37.3 },
      { id: 34, type: "33e", x: 8, y: 37.3 },
      { id: 35, type: "33c", x: 59.2, y: 10.8 },
      { id: 36, type: "33c", x: 61.2, y: 14.8 },
      { id: 37, type: "33c", x: 78.7, y: 11 },
      { id: 38, type: "33c", x: 77.3, y: 14.5 },
      { id: 39, type: "33c", x: 88.3, y: 13.9 },
      { id: 40, type: "33c", x: 88.1, y: 29.9 },
      { id: 41, type: "33c", x: 78.7, y: 27.8 },
      { id: 42, type: "33c", x: 76.7, y: 31.9 },
      { id: 43, type: "33c", x: 61.2, y: 31.9 },
      { id: 44, type: "33c", x: 59.7, y: 28.1 },
      { id: 45, type: "33c", x: 59.6, y: 44.9 },
      { id: 46, type: "33c", x: 61.6, y: 48.5 },
      { id: 47, type: "33c", x: 78.8, y: 44.7 },
      { id: 48, type: "33c", x: 77, y: 48.3 },
      { id: 49, type: "33c", x: 88.7, y: 49.5 },
      { id: 50, type: "33c", x: 59.4, y: 59.4 },
      { id: 51, type: "33c", x: 61.1, y: 62.7 },
      { id: 52, type: "33c", x: 78.3, y: 59.1 },
      { id: 53, type: "33c", x: 76.9, y: 62.6 },
      { id: 54, type: "33c", x: 88.5, y: 63.8 },
      { id: 55, type: "33c", x: 88.3, y: 77.7 },
      { id: 56, type: "33c", x: 78.5, y: 73.2 },
      { id: 57, type: "33c", x: 76.9, y: 77.6 },
      { id: 58, type: "33c", x: 59.2, y: 73.4 },
      { id: 59, type: "33c", x: 61, y: 77.5 },
      { id: 60, type: "33b", x: 66.3, y: 11.1 },
      { id: 61, type: "33b", x: 72.3, y: 11.3 },
      { id: 62, type: "33b", x: 66.3, y: 28 },
      { id: 63, type: "33b", x: 72, y: 28.1 },
      { id: 64, type: "33b", x: 72.3, y: 44.8 },
      { id: 65, type: "33b", x: 66.2, y: 44.7 },
      { id: 66, type: "33b", x: 66.1, y: 59.2 },
      { id: 67, type: "33b", x: 72.1, y: 59.4 },
      { id: 68, type: "33b", x: 72, y: 73.8 },
      { id: 69, type: "33b", x: 65.9, y: 73.8 },
      { id: 70, type: "33b", x: 93, y: 9.8 },
      { id: 71, type: "33b", x: 92.9, y: 25.6 },
      { id: 72, type: "33b", x: 93.1, y: 45.5 },
      { id: 73, type: "33b", x: 93.1, y: 59.8 },
      { id: 74, type: "33b", x: 93, y: 74.3 },
      { id: 75, type: "29a", x: 85.9, y: 10.7 },
      { id: 76, type: "29a", x: 86.4, y: 26.1 },
      { id: 77, type: "29a", x: 88.4, y: 40.2 },
      { id: 78, type: "29a", x: 86.7, y: 45.8 },
      { id: 79, type: "29a", x: 86.6, y: 60.2 },
      { id: 80, type: "29a", x: 86.5, y: 74.1 },
      { id: 81, type: "33a", x: 46.3, y: 50.9 },
      { id: 82, type: "33a", x: 51.7, y: 51 },
      { id: 83, type: "33a", x: 51.7, y: 61.7 },
      { id: 84, type: "33a", x: 46.2, y: 61.5 },
      { id: 85, type: "33a", x: 52, y: 72 },
      { id: 86, type: "33a", x: 46.1, y: 71.8 },
      { id: 87, type: "33a", x: 42.1, y: 71.9 },
      { id: 88, type: "33a", x: 36.8, y: 72 },
      { id: 89, type: "33a", x: 36.7, y: 82.5 },
      { id: 90, type: "33a", x: 42.3, y: 82.5 },
      { id: 91, type: "33a", x: 46, y: 82.4 },
      { id: 92, type: "33a", x: 52.1, y: 82.6 },
      { id: 93, type: "33d", x: 32.3, y: 34 },
      { id: 94, type: "33a", x: 37, y: 93.2 },
      { id: 95, type: "33a", x: 42.1, y: 93.1 },
      { id: 96, type: "33a", x: 45.8, y: 92.9 },
      { id: 97, type: "33a", x: 51.9, y: 93 },
      { id: 98, type: "33c", x: 59.3, y: 87.6 },
      { id: 99, type: "33c", x: 61.2, y: 91.8 },
      { id: 100, type: "33c", x: 78.5, y: 87.8 },
      { id: 101, type: "33c", x: 76.8, y: 91.8 },
      { id: 102, type: "33c", x: 88.5, y: 92 },
      { id: 103, type: "33b", x: 66.1, y: 88.3 },
      { id: 104, type: "33b", x: 72.1, y: 88.3 },
      { id: 105, type: "33b", x: 93.2, y: 88.2 },
      { id: 106, type: "29a", x: 86.6, y: 88.1 },
    ],
  },
  ocean_kukdong: {
    image: "/apt_map/ocean/kukdong.jpg",
    hotspots: [
      { id: 3, type: "34a", x: 31.6, y: 10.3 },
      { id: 4, type: "34a", x: 36, y: 10.2 },
      { id: 5, type: "34a", x: 23.4, y: 17.1 },
      { id: 6, type: "34a", x: 18.9, y: 17.1 },
      { id: 7, type: "34b", x: 9.4, y: 10.7 },
      { id: 8, type: "34b", x: 14.5, y: 16.3 },
      { id: 9, type: "34b", x: 14.6, y: 38.2 },
      { id: 10, type: "34b", x: 9.9, y: 32 },
      { id: 11, type: "34b", x: 36.6, y: 31 },
      { id: 12, type: "34b", x: 30.8, y: 36.6 },
      { id: 13, type: "34b", x: 53.3, y: 33.3 },
      { id: 14, type: "34b", x: 60.5, y: 33.3 },
      { id: 15, type: "34b", x: 76.7, y: 11.2 },
      { id: 16, type: "34b", x: 83.8, y: 11.2 },
      { id: 17, type: "34b", x: 60.4, y: 62.2 },
      { id: 18, type: "34b", x: 52.9, y: 62.2 },
      { id: 19, type: "34b", x: 36.3, y: 55.1 },
      { id: 20, type: "34b", x: 31.1, y: 60.1 },
      { id: 21, type: "34b", x: 14.6, y: 60.7 },
      { id: 22, type: "34b", x: 9.7, y: 54.4 },
      { id: 23, type: "34c", x: 6.3, y: 16.9 },
      { id: 24, type: "34c", x: 8.9, y: 19.8 },
      { id: 25, type: "34c", x: 6.2, y: 38.7 },
      { id: 26, type: "34c", x: 9.2, y: 42.4 },
      { id: 27, type: "34c", x: 6.2, y: 61.2 },
      { id: 28, type: "34c", x: 9.1, y: 64.3 },
      { id: 29, type: "34b", x: 42, y: 12.3 },
      { id: 30, type: "34b", x: 49.6, y: 11.9 },
      { id: 31, type: "39a", x: 56.2, y: 11.4 },
      { id: 32, type: "39a", x: 60.1, y: 11.4 },
      { id: 33, type: "39a", x: 66.3, y: 11.3 },
      { id: 34, type: "39a", x: 70.5, y: 11.4 },
      { id: 35, type: "39a", x: 66.7, y: 32.6 },
      { id: 36, type: "39a", x: 70.7, y: 32.5 },
      { id: 37, type: "39a", x: 66.4, y: 59 },
      { id: 38, type: "39a", x: 70.8, y: 59.3 },
      { id: 39, type: "39a", x: 23.8, y: 61.8 },
      { id: 40, type: "39a", x: 19.6, y: 61.7 },
      { id: 41, type: "39a", x: 19.4, y: 39.4 },
      { id: 42, type: "39a", x: 23.7, y: 39.3 },
      { id: 43, type: "39c", x: 43.7, y: 19.3 },
      { id: 44, type: "39c", x: 48.1, y: 19.2 },
      { id: 45, type: "39c", x: 78.3, y: 19.3 },
      { id: 46, type: "39c", x: 82.4, y: 19.1 },
      { id: 47, type: "39c", x: 58.9, y: 41.2 },
      { id: 48, type: "39c", x: 54.7, y: 41.3 },
      { id: 49, type: "39c", x: 40, y: 37.4 },
      { id: 50, type: "39c", x: 36.6, y: 41 },
      { id: 51, type: "39c", x: 39.9, y: 61.6 },
      { id: 52, type: "39c", x: 36.6, y: 65.1 },
      { id: 53, type: "39c", x: 54.6, y: 70.3 },
      { id: 54, type: "39c", x: 58.8, y: 70.2 },
      { id: 55, type: "43", x: 78.3, y: 43 },
      { id: 56, type: "43", x: 83.6, y: 43.2 },
      { id: 57, type: "43", x: 88.9, y: 43.3 },
      { id: 58, type: "43", x: 94.3, y: 43.3 },
      { id: 59, type: "43", x: 94, y: 67.7 },
      { id: 60, type: "43", x: 88.7, y: 67.2 },
      { id: 61, type: "43", x: 83.7, y: 67.4 },
      { id: 62, type: "43", x: 78.3, y: 67.6 },
      { id: 63, type: "59", x: 44, y: 35.1 },
      { id: 64, type: "59", x: 35, y: 45.1 },
      { id: 65, type: "59", x: 51.2, y: 44.1 },
      { id: 66, type: "59", x: 62.4, y: 43.9 },
      { id: 67, type: "59", x: 62.4, y: 73.3 },
      { id: 68, type: "59", x: 51, y: 73 },
      { id: 69, type: "59", x: 44, y: 59.4 },
      { id: 70, type: "59", x: 35.1, y: 68.7 },
      { id: 71, type: "34a", x: 89.9, y: 10.3 },
      { id: 72, type: "34a", x: 94.6, y: 10.3 },
      { id: 73, type: "49", x: 53.1, y: 90.6 },
      { id: 74, type: "49", x: 47.7, y: 83.1 },
      { id: 75, type: "49", x: 41.8, y: 82.9 },
      { id: 76, type: "49", x: 58.7, y: 90.7 },
      { id: 77, type: "49", x: 64.4, y: 90.9 },
      { id: 78, type: "49", x: 69.9, y: 90.9 },
      { id: 79, type: "49", x: 78, y: 90.8 },
      { id: 80, type: "49", x: 83.5, y: 90.7 },
      { id: 81, type: "49", x: 88.7, y: 90.9 },
      { id: 82, type: "49", x: 94.4, y: 91.1 },
      { id: 83, type: "59", x: 3.9, y: 95.3 },
      { id: 84, type: "59", x: 15.5, y: 95.3 },
      { id: 85, type: "59", x: 26.1, y: 95.2 },
      { id: 86, type: "59", x: 37.5, y: 95.2 },
      { id: 87, type: "39b", x: 6.1, y: 84.6 },
      { id: 88, type: "39b", x: 13.1, y: 84.4 },
      { id: 89, type: "39b", x: 28.2, y: 84.2 },
      { id: 90, type: "39b", x: 35.5, y: 84.5 },
      { id: 91, type: "39c", x: 7.5, y: 92.5 },
      { id: 92, type: "39c", x: 11.7, y: 92.3 },
      { id: 93, type: "39c", x: 29.4, y: 92.2 },
      { id: 94, type: "39c", x: 33.6, y: 92.4 },
      { id: 95, type: "85", x: 44.7, y: 86.5 },
      { id: 96, type: "85", x: 55.9, y: 94.4 },
      { id: 97, type: "85", x: 67.2, y: 94.8 },
      { id: 98, type: "85", x: 81, y: 94.7 },
      { id: 99, type: "85", x: 91.4, y: 94.7 },
    ],
  },
  ocean_lotte: {
    image: "/apt_map/ocean/lotte.jpg",
    hotspots: [
      { id: 184, type: "33a", x: 8.2, y: 13.3 },
      { id: 185, type: "33a", x: 12.5, y: 13.3 },
      { id: 186, type: "33a", x: 8.2, y: 36.5 },
      { id: 187, type: "33a", x: 12.4, y: 36 },
      { id: 188, type: "33a", x: 8.3, y: 58.4 },
      { id: 189, type: "33a", x: 12.5, y: 58.6 },
      { id: 190, type: "33a", x: 8, y: 81.3 },
      { id: 191, type: "33a", x: 12.5, y: 81.6 },
      { id: 192, type: "33a", x: 70.7, y: 16 },
      { id: 193, type: "33a", x: 74.8, y: 16 },
      { id: 194, type: "33a", x: 81.9, y: 16 },
      { id: 195, type: "33a", x: 86.1, y: 16 },
      { id: 196, type: "33a", x: 86.5, y: 40.2 },
      { id: 197, type: "33a", x: 81.9, y: 40.1 },
      { id: 198, type: "33a", x: 74.8, y: 40 },
      { id: 199, type: "33a", x: 70.9, y: 40.1 },
      { id: 200, type: "33a", x: 70.7, y: 64.3 },
      { id: 201, type: "33a", x: 74.9, y: 64 },
      { id: 202, type: "33a", x: 81.9, y: 64.2 },
      { id: 203, type: "33a", x: 86.3, y: 64.3 },
      { id: 204, type: "33b", x: 20.6, y: 8.3 },
      { id: 205, type: "33b", x: 16.2, y: 13.3 },
      { id: 206, type: "33b", x: 35.5, y: 14.5 },
      { id: 207, type: "33b", x: 39.5, y: 9.3 },
      { id: 208, type: "33b", x: 20.2, y: 30.9 },
      { id: 209, type: "33b", x: 16, y: 36.1 },
      { id: 210, type: "33b", x: 20.5, y: 53.6 },
      { id: 211, type: "33b", x: 15.9, y: 59 },
      { id: 212, type: "33b", x: 20.5, y: 76.2 },
      { id: 213, type: "33b", x: 16.4, y: 81.5 },
      { id: 214, type: "33b", x: 90.7, y: 10.8 },
      { id: 215, type: "33b", x: 90.6, y: 34.6 },
      { id: 216, type: "33b", x: 90.9, y: 58.6 },
      { id: 217, type: "54", x: 59, y: 15.3 },
      { id: 218, type: "54", x: 66.1, y: 15.5 },
      { id: 219, type: "54", x: 59.3, y: 39.3 },
      { id: 220, type: "54", x: 65.8, y: 39.4 },
      { id: 221, type: "54", x: 59.4, y: 63.5 },
      { id: 222, type: "54", x: 66.1, y: 63.6 },
      { id: 223, type: "46b", x: 39.8, y: 31.9 },
      { id: 224, type: "46b", x: 34.7, y: 37.4 },
      { id: 225, type: "46b", x: 39.8, y: 54.8 },
      { id: 226, type: "46b", x: 34.6, y: 60.1 },
      { id: 227, type: "46b", x: 40.2, y: 77.5 },
      { id: 228, type: "46b", x: 34.7, y: 83.2 },
      { id: 229, type: "38", x: 24.7, y: 14.3 },
      { id: 230, type: "38", x: 21.5, y: 17.8 },
      { id: 231, type: "38", x: 24.4, y: 36.8 },
      { id: 232, type: "38", x: 21.2, y: 40.4 },
      { id: 233, type: "38", x: 24.5, y: 59.8 },
      { id: 234, type: "38", x: 21.3, y: 63.5 },
      { id: 235, type: "38", x: 43.7, y: 15.4 },
      { id: 236, type: "38", x: 40.4, y: 18.9 },
      { id: 237, type: "38", x: 94.5, y: 16.7 },
      { id: 238, type: "38", x: 91.7, y: 19.7 },
      { id: 239, type: "38", x: 94.7, y: 40.8 },
      { id: 240, type: "38", x: 91.5, y: 44.4 },
      { id: 241, type: "38", x: 94.7, y: 65 },
      { id: 242, type: "38", x: 91.3, y: 68.1 },
      { id: 243, type: "46a", x: 43.9, y: 61.9 },
      { id: 244, type: "46a", x: 41.3, y: 65.3 },
      { id: 245, type: "46a", x: 44.3, y: 84.9 },
      { id: 246, type: "46a", x: 41.2, y: 88.1 },
      { id: 247, type: "38", x: 24.5, y: 82.4 },
      { id: 248, type: "38", x: 21.5, y: 86 },
      { id: 249, type: "54", x: 59.3, y: 87.3 },
      { id: 250, type: "54", x: 66.3, y: 87.5 },
      { id: 251, type: "33a", x: 70.7, y: 87.8 },
      { id: 252, type: "33a", x: 75, y: 87.8 },
      { id: 253, type: "33a", x: 81.9, y: 88 },
      { id: 254, type: "33a", x: 86.3, y: 88 },
      { id: 255, type: "33b", x: 90.9, y: 82 },
      { id: 256, type: "38", x: 94.8, y: 88.7 },
      { id: 257, type: "38", x: 91.9, y: 91.8 },
      { id: 258, type: "46a", x: 43.6, y: 38.7 },
      { id: 259, type: "46a", x: 41, y: 42.8 },
    ],
  },
  ocean_qweendom_edison: {
    image: "/apt_map/ocean/qweendom_edison.jpg",
    hotspots: [
      { id: 107, type: "55", x: 25, y: 13.5 },
      { id: 108, type: "55", x: 19.7, y: 38.3 },
      { id: 109, type: "46a", x: 31.5, y: 13.3 },
      { id: 110, type: "46a", x: 26.3, y: 38 },
      { id: 111, type: "46a", x: 31.9, y: 37.9 },
      { id: 112, type: "46a", x: 38.6, y: 42 },
      { id: 113, type: "39d", x: 36.9, y: 14.2 },
      { id: 114, type: "39d", x: 42.9, y: 19.1 },
      { id: 115, type: "39d", x: 59.8, y: 17.7 },
      { id: 116, type: "33b", x: 49.1, y: 21 },
      { id: 117, type: "33b", x: 56.3, y: 20.9 },
      { id: 118, type: "33a", x: 50.7, y: 27.4 },
      { id: 119, type: "33a", x: 55.1, y: 27.6 },
      { id: 120, type: "55", x: 14.5, y: 61.4 },
      { id: 121, type: "55", x: 9.8, y: 86.3 },
      { id: 122, type: "46a", x: 21.2, y: 61.3 },
      { id: 123, type: "46a", x: 26.8, y: 61.4 },
      { id: 124, type: "46a", x: 33.6, y: 65.4 },
      { id: 125, type: "46a", x: 16.4, y: 86.3 },
      { id: 126, type: "46a", x: 22, y: 86.3 },
      { id: 127, type: "46a", x: 28.8, y: 90.4 },
      { id: 128, type: "33b", x: 39.7, y: 82.9 },
      { id: 129, type: "33b", x: 46.8, y: 82.9 },
      { id: 130, type: "33a", x: 40.8, y: 90 },
      { id: 131, type: "33a", x: 45.3, y: 90.1 },
      { id: 136, type: "39d", x: 66.3, y: 13.9 },
      { id: 137, type: "46a", x: 78, y: 17.6 },
      { id: 138, type: "46a", x: 83.6, y: 17.4 },
      { id: 139, type: "34a", x: 91.4, y: 13.1 },
      { id: 140, type: "39c", x: 89.3, y: 24.2 },
      { id: 141, type: "39c", x: 92.6, y: 22.1 },
      { id: 142, type: "34b", x: 66.4, y: 40.4 },
      { id: 143, type: "34b", x: 69.9, y: 45.5 },
      { id: 144, type: "34b", x: 72.9, y: 50.3 },
      { id: 145, type: "34b", x: 78, y: 53.3 },
      { id: 146, type: "34a", x: 84.6, y: 50.1 },
      { id: 147, type: "34a", x: 91.5, y: 44.3 },
      { id: 148, type: "39c", x: 89.4, y: 56 },
      { id: 149, type: "39c", x: 92.9, y: 53.4 },
      { id: 150, type: "39d", x: 54.6, y: 68.6 },
      { id: 151, type: "39d", x: 60.8, y: 73.3 },
      { id: 152, type: "34b", x: 63.9, y: 77.6 },
      { id: 153, type: "34b", x: 68.9, y: 79.7 },
      { id: 154, type: "46a", x: 77.8, y: 80.3 },
      { id: 155, type: "46a", x: 83.3, y: 80.2 },
      { id: 156, type: "39c", x: 89.4, y: 86.6 },
      { id: 157, type: "39c", x: 92.8, y: 84.3 },
      { id: 158, type: "34a", x: 91.5, y: 75.3 },
      { id: 489, type: "87", x: 21.3, y: 18.8 },
      { id: 490, type: "87", x: 16.3, y: 43.1 },
      { id: 491, type: "87", x: 10.9, y: 66.4 },
      { id: 492, type: "87", x: 7.1, y: 92 },
    ],
  },
  ocean_qweendom_lincoln: {
    image: "/apt_map/ocean/qweendom_lincoln.jpg",
    hotspots: [
      { id: 493, type: "87", x: 6.3, y: 14.4 },
      { id: 494, type: "87", x: 5.4, y: 34.3 },
      { id: 495, type: "87", x: 5.2, y: 54 },
      { id: 496, type: "87", x: 5.1, y: 73.3 },
      { id: 497, type: "55", x: 10.1, y: 11.1 },
      { id: 498, type: "55", x: 8.2, y: 30.5 },
      { id: 499, type: "55", x: 8.3, y: 49.5 },
      { id: 500, type: "55", x: 8.7, y: 68.5 },
      { id: 501, type: "46a", x: 16.2, y: 11.6 },
      { id: 502, type: "46a", x: 14.6, y: 30.4 },
      { id: 503, type: "46a", x: 14.6, y: 49.8 },
      { id: 504, type: "46a", x: 14.5, y: 68.5 },
      { id: 505, type: "46c", x: 21.1, y: 11.4 },
      { id: 506, type: "46c", x: 19.1, y: 30.5 },
      { id: 507, type: "46c", x: 19.2, y: 49.4 },
      { id: 508, type: "46c", x: 19.2, y: 68.3 },
      { id: 509, type: "39c", x: 30, y: 12.3 },
      { id: 510, type: "39c", x: 27.3, y: 15.1 },
      { id: 511, type: "39c", x: 28.2, y: 31.6 },
      { id: 512, type: "39c", x: 25.6, y: 34.4 },
      { id: 513, type: "39c", x: 28.5, y: 51 },
      { id: 514, type: "39c", x: 26, y: 53.9 },
      { id: 515, type: "39c", x: 28.3, y: 69.7 },
      { id: 516, type: "39c", x: 25.8, y: 72.8 },
      { id: 517, type: "39d", x: 37.7, y: 10.9 },
      { id: 518, type: "39d", x: 43.8, y: 13.8 },
      { id: 519, type: "33a", x: 63.9, y: 13.9 },
      { id: 520, type: "33a", x: 68.3, y: 13.9 },
      { id: 521, type: "33a", x: 41.2, y: 41.2 },
      { id: 522, type: "33a", x: 46, y: 41.6 },
      { id: 523, type: "33a", x: 46, y: 68.1 },
      { id: 524, type: "33a", x: 41.2, y: 68.2 },
      { id: 525, type: "33b", x: 40, y: 36.1 },
      { id: 526, type: "33b", x: 46.8, y: 35.9 },
      { id: 527, type: "33b", x: 62.6, y: 8.8 },
      { id: 528, type: "33b", x: 69.5, y: 8.8 },
      { id: 529, type: "33b", x: 40.2, y: 63 },
      { id: 530, type: "33b", x: 46.7, y: 62.9 },
      { id: 531, type: "34b", x: 47, y: 17.3 },
      { id: 532, type: "34b", x: 50, y: 21.3 },
      { id: 533, type: "46a", x: 79, y: 11.6 },
      { id: 534, type: "46a", x: 85.2, y: 12 },
      { id: 535, type: "46a", x: 77.4, y: 39.6 },
      { id: 536, type: "46a", x: 62, y: 32.5 },
      { id: 537, type: "34a", x: 92.1, y: 8.1 },
      { id: 538, type: "34a", x: 92.2, y: 32.6 },
      { id: 539, type: "34a", x: 85.7, y: 37.5 },
      { id: 540, type: "34a", x: 92.1, y: 57.7 },
      { id: 541, type: "34a", x: 85.7, y: 62.1 },
      { id: 542, type: "39c", x: 93.4, y: 14.8 },
      { id: 543, type: "39c", x: 90.3, y: 17.2 },
      { id: 544, type: "39c", x: 93.2, y: 40.1 },
      { id: 545, type: "39c", x: 90, y: 42.3 },
      { id: 546, type: "39c", x: 93.4, y: 64.7 },
      { id: 547, type: "39c", x: 89.9, y: 67 },
      { id: 548, type: "46b", x: 66.4, y: 37 },
      { id: 549, type: "46b", x: 71.3, y: 39.2 },
      { id: 550, type: "39b", x: 71.6, y: 61.6 },
      { id: 551, type: "39b", x: 67.7, y: 63.5 },
      { id: 552, type: "39a", x: 77.6, y: 61.5 },
      { id: 553, type: "39a", x: 63.5, y: 69.1 },
      { id: 554, type: "87", x: 5, y: 92 },
      { id: 555, type: "55", x: 8.8, y: 87.8 },
      { id: 556, type: "46a", x: 14.5, y: 87.7 },
      { id: 557, type: "46c", x: 19.3, y: 87.8 },
      { id: 558, type: "39c", x: 28.2, y: 89 },
      { id: 559, type: "39c", x: 25.8, y: 91.7 },
      { id: 560, type: "34b", x: 37.6, y: 91.6 },
      { id: 561, type: "34b", x: 41.8, y: 90 },
      { id: 562, type: "34b", x: 45, y: 86.9 },
      { id: 563, type: "34b", x: 48.1, y: 82.6 },
      { id: 564, type: "33b", x: 58.3, y: 84.7 },
      { id: 565, type: "33b", x: 65, y: 84.7 },
      { id: 566, type: "33a", x: 59.6, y: 89.8 },
      { id: 567, type: "33a", x: 64, y: 90 },
      { id: 568, type: "39c", x: 90.2, y: 91.6 },
      { id: 569, type: "39c", x: 93.5, y: 89.1 },
      { id: 570, type: "34a", x: 92, y: 81.8 },
      { id: 571, type: "34a", x: 85.6, y: 86.5 },
      { id: 572, type: "46a", x: 73.7, y: 85.9 },
      { id: 573, type: "46a", x: 80.3, y: 86.1 },
    ],
  },
  ocean_qweendom_einstein: {
    image: "/apt_map/ocean/qweendom_einstein.jpg",
    hotspots: [
      { id: 159, type: "33a", x: 5.7, y: 15.1 },
      { id: 160, type: "33a", x: 9.8, y: 15 },
      { id: 161, type: "33a", x: 9.6, y: 35.9 },
      { id: 162, type: "33a", x: 5.6, y: 35.8 },
      { id: 163, type: "33a", x: 41.4, y: 16.7 },
      { id: 164, type: "33a", x: 45.3, y: 16.7 },
      { id: 165, type: "33a", x: 45.4, y: 37.1 },
      { id: 166, type: "33a", x: 41.5, y: 37.1 },
      { id: 167, type: "33b", x: 4.8, y: 9.7 },
      { id: 168, type: "33b", x: 10.6, y: 9.5 },
      { id: 169, type: "33b", x: 10.4, y: 30.3 },
      { id: 170, type: "33b", x: 4.6, y: 30.3 },
      { id: 171, type: "33b", x: 40.3, y: 11.4 },
      { id: 172, type: "33b", x: 46.1, y: 11.5 },
      { id: 173, type: "33b", x: 46.1, y: 31.7 },
      { id: 174, type: "33b", x: 40.6, y: 31.9 },
      { id: 175, type: "46a", x: 18.2, y: 10.6 },
      { id: 176, type: "46a", x: 23.4, y: 10.4 },
      { id: 177, type: "46a", x: 23.9, y: 31.5 },
      { id: 178, type: "46a", x: 18.6, y: 31.5 },
      { id: 179, type: "39d", x: 27.5, y: 11.1 },
      { id: 180, type: "39d", x: 32.8, y: 13.9 },
      { id: 181, type: "39d", x: 28, y: 32 },
      { id: 182, type: "39d", x: 33.3, y: 35 },
      { id: 183, type: "46a", x: 54, y: 10.5 },
      { id: 184, type: "46a", x: 59.4, y: 10.4 },
      { id: 185, type: "46a", x: 88.8, y: 10.6 },
      { id: 186, type: "46a", x: 88.7, y: 29.5 },
      { id: 187, type: "46a", x: 88.6, y: 48.1 },
      { id: 188, type: "55", x: 93.8, y: 10.6 },
      { id: 189, type: "55", x: 93.8, y: 29.4 },
      { id: 190, type: "55", x: 93.7, y: 48.2 },
      { id: 191, type: "46c", x: 84.3, y: 10.9 },
      { id: 192, type: "46c", x: 84.4, y: 29.8 },
      { id: 193, type: "46c", x: 84.3, y: 48.2 },
      { id: 194, type: "39c", x: 77.3, y: 11.9 },
      { id: 195, type: "39c", x: 79.6, y: 14.7 },
      { id: 196, type: "39c", x: 77.1, y: 30.5 },
      { id: 197, type: "39c", x: 79.3, y: 33.6 },
      { id: 198, type: "39c", x: 76.8, y: 49.7 },
      { id: 199, type: "39d", x: 63.4, y: 11 },
      { id: 200, type: "39d", x: 68.7, y: 14.1 },
      { id: 201, type: "39d", x: 53.8, y: 31 },
      { id: 202, type: "39d", x: 58.9, y: 34 },
      { id: 203, type: "33b", x: 61.5, y: 36.9 },
      { id: 204, type: "33b", x: 67.3, y: 36.8 },
      { id: 205, type: "33a", x: 62.4, y: 42.2 },
      { id: 206, type: "33a", x: 66.3, y: 42.3 },
      { id: 207, type: "55", x: 93.7, y: 67.2 },
      { id: 208, type: "55", x: 93.7, y: 85.9 },
      { id: 209, type: "46c", x: 84.5, y: 67.4 },
      { id: 210, type: "46c", x: 84.3, y: 86 },
      { id: 211, type: "46a", x: 88.7, y: 67.2 },
      { id: 212, type: "46a", x: 88.6, y: 85.9 },
      { id: 213, type: "39c", x: 76.9, y: 68.7 },
      { id: 214, type: "39c", x: 79, y: 71.7 },
      { id: 215, type: "39c", x: 76.8, y: 87.4 },
      { id: 216, type: "39c", x: 78.9, y: 90.2 },
      { id: 217, type: "33b", x: 61.5, y: 61.4 },
      { id: 218, type: "33b", x: 67.3, y: 61.4 },
      { id: 219, type: "33b", x: 61.6, y: 83.7 },
      { id: 220, type: "33b", x: 67.2, y: 83.8 },
      { id: 221, type: "33a", x: 62.4, y: 66.8 },
      { id: 222, type: "33a", x: 66.3, y: 66.8 },
      { id: 223, type: "33a", x: 66.5, y: 89 },
      { id: 224, type: "33a", x: 62.7, y: 89.1 },
      { id: 225, type: "46a", x: 37.7, y: 58.6 },
      { id: 226, type: "46a", x: 43, y: 58.6 },
      { id: 227, type: "46a", x: 47.7, y: 58.6 },
      { id: 228, type: "46a", x: 52.9, y: 61.8 },
      { id: 229, type: "33a", x: 40.6, y: 89.1 },
      { id: 230, type: "33a", x: 44.4, y: 89.4 },
      { id: 231, type: "33b", x: 39.6, y: 83.9 },
      { id: 232, type: "33b", x: 45.3, y: 83.9 },
      { id: 709, type: "39a", x: 51.8, y: 76.3 },
      { id: 710, type: "39a", x: 48.2, y: 80.9 },
    ],
  },
  ocean_samjung: {
    image: "/apt_map/ocean/samjung.jpg",
    hotspots: [
      { id: 577, type: "28", x: 57.6, y: 9.7 },
      { id: 578, type: "28", x: 67.4, y: 14.5 },
      { id: 579, type: "28", x: 77, y: 14.5 },
      { id: 582, type: "28", x: 67.4, y: 34.7 },
      { id: 583, type: "28", x: 78.1, y: 34.3 },
      { id: 584, type: "28", x: 58.2, y: 24.8 },
      { id: 585, type: "28", x: 58.6, y: 30.4 },
      { id: 586, type: "28", x: 58.2, y: 44.6 },
      { id: 587, type: "28", x: 58.2, y: 49.7 },
      { id: 588, type: "28", x: 67.6, y: 54.3 },
      { id: 589, type: "28", x: 77.3, y: 54.1 },
      { id: 590, type: "28", x: 12.1, y: 50.8 },
      { id: 591, type: "34b", x: 9.8, y: 16.9 },
      { id: 592, type: "34b", x: 8.8, y: 37.3 },
      { id: 593, type: "34b", x: 10.4, y: 56.4 },
      { id: 594, type: "34b", x: 57.6, y: 55.8 },
      { id: 595, type: "34b", x: 87.7, y: 55.8 },
      { id: 596, type: "34b", x: 86.9, y: 36.1 },
      { id: 597, type: "34b", x: 57, y: 36.1 },
      { id: 598, type: "34b", x: 57.4, y: 16.2 },
      { id: 599, type: "34b", x: 87.5, y: 16.1 },
      { id: 600, type: "34a", x: 29.1, y: 15.6 },
      { id: 601, type: "34a", x: 41.2, y: 15.7 },
      { id: 604, type: "34a", x: 41.2, y: 54.9 },
      { id: 605, type: "34a", x: 29.7, y: 55.1 },
      { id: 606, type: "31", x: 20.5, y: 15.1 },
      { id: 607, type: "31", x: 18.8, y: 35.8 },
      { id: 609, type: "31", x: 12.1, y: 45.8 },
      { id: 610, type: "31", x: 20.3, y: 54.5 },
      { id: 611, type: "31", x: 86.3, y: 44.8 },
      { id: 612, type: "31", x: 86.5, y: 50.6 },
      { id: 613, type: "31", x: 87.3, y: 25.9 },
      { id: 614, type: "31", x: 86.7, y: 30.8 },
      { id: 615, type: "31", x: 86.9, y: 63.2 },
      { id: 616, type: "31", x: 12.5, y: 65.6 },
      { id: 617, type: "34a", x: 29.3, y: 74.9 },
      { id: 618, type: "34a", x: 41, y: 74.5 },
      { id: 619, type: "34a", x: 57.6, y: 73.9 },
      { id: 620, type: "34a", x: 69.1, y: 73.5 },
      { id: 621, type: "31", x: 12.1, y: 84.9 },
      { id: 622, type: "31", x: 20.7, y: 73.9 },
      { id: 623, type: "31", x: 87.3, y: 69 },
      { id: 624, type: "31", x: 78.7, y: 91.1 },
      { id: 625, type: "28", x: 12.5, y: 70.3 },
      { id: 626, type: "28", x: 86.5, y: 81.6 },
      { id: 627, type: "28", x: 77.9, y: 73 },
      { id: 628, type: "28", x: 86.3, y: 86.5 },
      { id: 629, type: "28", x: 94.1, y: 91.8 },
      { id: 630, type: "39", x: 22.8, y: 90.5 },
      { id: 631, type: "39", x: 35.5, y: 90.1 },
      { id: 632, type: "39", x: 54.9, y: 91.9 },
      { id: 633, type: "39", x: 67.4, y: 91.8 },
      { id: 634, type: "34b", x: 10, y: 90.3 },
      { id: 635, type: "34b", x: 10.5, y: 75.8 },
      { id: 636, type: "34b", x: 87.9, y: 74.1 },
      { id: 637, type: "34a", x: 30, y: 36.1 },
      { id: 638, type: "34a", x: 41.5, y: 36 },
      { id: 639, type: "31", x: 11.6, y: 25.9 },
      { id: 640, type: "28", x: 11.8, y: 31.6 },
      { id: 641, type: "28", x: 85.4, y: 4.9 },
      { id: 642, type: "28", x: 85.6, y: 10.8 },
    ],
  },
  ocean_solmare: {
    image: "/apt_map/ocean/solmare.jpg",
    hotspots: [
      { id: 254, type: "33a", x: 53.2, y: 24 },
      { id: 255, type: "36a", x: 55.6, y: 20.6 },
      { id: 259, type: "33b", x: 58, y: 28.6 },
      { id: 260, type: "36", x: 55.7, y: 32.1 },
      { id: 261, type: "36", x: 13.3, y: 33.9 },
      { id: 262, type: "36a", x: 55.8, y: 36.6 },
      { id: 263, type: "36a", x: 70.2, y: 39.4 },
      { id: 264, type: "36a", x: 85.8, y: 39.4 },
      { id: 267, type: "33a", x: 73.9, y: 42.3 },
      { id: 268, type: "33a", x: 81.2, y: 42.3 },
      { id: 269, type: "33a", x: 89.7, y: 42.4 },
      { id: 275, type: "36", x: 55.7, y: 47.8 },
      { id: 276, type: "36a", x: 20.1, y: 41.8 },
      { id: 277, type: "36a", x: 35.9, y: 40.8 },
      { id: 285, type: "36", x: 13.3, y: 50.7 },
      { id: 300, type: "32", x: 45.7, y: 67.5 },
      { id: 301, type: "32", x: 56.6, y: 73.7 },
      { id: 310, type: "36b", x: 31.4, y: 72.1 },
      { id: 311, type: "36b", x: 41.2, y: 79.9 },
      { id: 312, type: "36b", x: 53.1, y: 85.3 },
      { id: 643, type: "33a", x: 11.9, y: 41.7 },
      { id: 644, type: "33a", x: 22, y: 44.5 },
      { id: 645, type: "33a", x: 29.9, y: 43.4 },
      { id: 646, type: "33a", x: 38.5, y: 43.3 },
      { id: 647, type: "33b", x: 14.7, y: 47.4 },
      { id: 648, type: "33a", x: 11.1, y: 7.4 },
      { id: 649, type: "33a", x: 22.1, y: 9.3 },
      { id: 650, type: "33a", x: 28.8, y: 8.3 },
      { id: 651, type: "33a", x: 38.3, y: 8.2 },
      { id: 652, type: "33b", x: 13.7, y: 12.4 },
      { id: 653, type: "33a", x: 51.8, y: 7 },
      { id: 654, type: "33a", x: 65, y: 8.7 },
      { id: 655, type: "33a", x: 73, y: 8.7 },
      { id: 656, type: "33a", x: 80.8, y: 8.9 },
      { id: 657, type: "33a", x: 89.3, y: 8.8 },
      { id: 658, type: "33b", x: 56.8, y: 11.4 },
      { id: 659, type: "33a", x: 89.6, y: 25.5 },
      { id: 660, type: "33a", x: 81.4, y: 25.5 },
      { id: 661, type: "33a", x: 74, y: 25.5 },
      { id: 662, type: "33a", x: 65.8, y: 25.6 },
      { id: 663, type: "36a", x: 69.5, y: 22.9 },
      { id: 664, type: "36a", x: 85.4, y: 23 },
      { id: 665, type: "33a", x: 52.8, y: 40.2 },
      { id: 666, type: "33a", x: 65.6, y: 42 },
      { id: 667, type: "33b", x: 57.5, y: 44.5 },
      { id: 668, type: "33a", x: 54.2, y: 57.3 },
      { id: 669, type: "33a", x: 67.1, y: 58.6 },
      { id: 670, type: "33a", x: 75.5, y: 58.5 },
      { id: 671, type: "29", x: 68.4, y: 69.4 },
      { id: 672, type: "29", x: 76.1, y: 69.5 },
      { id: 673, type: "29", x: 82.6, y: 69.5 },
      { id: 674, type: "29", x: 91.4, y: 69.4 },
      { id: 675, type: "33a", x: 11.2, y: 25 },
      { id: 676, type: "33a", x: 21.9, y: 27.3 },
      { id: 677, type: "33a", x: 30.3, y: 26.1 },
      { id: 678, type: "33a", x: 38.7, y: 26.1 },
      { id: 679, type: "36a", x: 20, y: 24.6 },
      { id: 680, type: "36a", x: 33.9, y: 23.7 },
      { id: 681, type: "33b", x: 14, y: 30 },
      { id: 682, type: "33a", x: 14.7, y: 58 },
      { id: 683, type: "33a", x: 26.1, y: 60.9 },
      { id: 684, type: "33a", x: 33.8, y: 58.3 },
      { id: 685, type: "33b", x: 18.9, y: 63.5 },
      { id: 686, type: "33b", x: 59.6, y: 61.1 },
      { id: 687, type: "29", x: 40.1, y: 67.9 },
      { id: 688, type: "29", x: 45.6, y: 72 },
      { id: 689, type: "29", x: 51.2, y: 75.1 },
      { id: 690, type: "29", x: 58.5, y: 78.2 },
      { id: 691, type: "29", x: 67.6, y: 80.3 },
      { id: 692, type: "29", x: 76, y: 80.4 },
      { id: 693, type: "29", x: 82.5, y: 80.3 },
      { id: 694, type: "29", x: 91.4, y: 80.4 },
      { id: 695, type: "39", x: 65, y: 91.6 },
      { id: 696, type: "39", x: 73.6, y: 91.4 },
      { id: 697, type: "39", x: 81.4, y: 91.5 },
      { id: 698, type: "39", x: 90.5, y: 91.4 },
      { id: 699, type: "42", x: 69.1, y: 88.2 },
      { id: 700, type: "42", x: 85.7, y: 88.4 },
      { id: 701, type: "33c", x: 24.7, y: 72.4 },
      { id: 702, type: "33c", x: 30, y: 76.8 },
      { id: 703, type: "33c", x: 35.2, y: 80.4 },
      { id: 704, type: "33c", x: 41.7, y: 84.3 },
      { id: 705, type: "33c", x: 47.3, y: 86.7 },
      { id: 706, type: "33c", x: 54.2, y: 89.6 },
      { id: 707, type: "32", x: 72.2, y: 77.4 },
      { id: 708, type: "32", x: 87.2, y: 77.5 },
    ],
  },
  ocean_blueocean4: {
    image: "/apt_map/ocean/blueocean4.jpg",
    hotspots: [
      { id: 319, type: "46a", x: 5.7, y: 10.5 },
      { id: 320, type: "46a", x: 10.8, y: 10.6 },
      { id: 321, type: "46a", x: 16, y: 10.4 },
      { id: 322, type: "46a", x: 21.3, y: 10.4 },
      { id: 323, type: "46b", x: 36.8, y: 10.7 },
      { id: 324, type: "46b", x: 44, y: 10.4 },
      { id: 325, type: "46b", x: 43.1, y: 36.6 },
      { id: 326, type: "46b", x: 35.8, y: 36.9 },
      { id: 327, type: "54a", x: 5.5, y: 31.4 },
      { id: 328, type: "54a", x: 11.6, y: 31.6 },
      { id: 329, type: "54b", x: 40.8, y: 17.1 },
      { id: 330, type: "54b", x: 40.2, y: 43.3 },
      { id: 331, type: "66", x: 16.6, y: 31.2 },
      { id: 332, type: "66", x: 24.2, y: 28.9 },
      { id: 333, type: "66", x: 53.9, y: 13.5 },
      { id: 334, type: "66", x: 53.8, y: 30.5 },
      { id: 335, type: "88b", x: 61.1, y: 14.5 },
      { id: 336, type: "88b", x: 61.1, y: 31.5 },
      { id: 337, type: "69b", x: 64.1, y: 9.9 },
      { id: 338, type: "69b", x: 64.1, y: 27.1 },
      { id: 339, type: "54a", x: 5.5, y: 51.4 },
      { id: 340, type: "54a", x: 11.6, y: 51.5 },
      { id: 341, type: "54a", x: 16.7, y: 51.5 },
      { id: 342, type: "54a", x: 23, y: 51.4 },
      { id: 343, type: "54a", x: 5.9, y: 71.5 },
      { id: 344, type: "54a", x: 12, y: 71.6 },
      { id: 345, type: "66", x: 16.7, y: 71.6 },
      { id: 346, type: "66", x: 24.9, y: 73.7 },
      { id: 347, type: "46b", x: 34.3, y: 61.5 },
      { id: 348, type: "46b", x: 41.5, y: 61 },
      { id: 349, type: "54b", x: 38.6, y: 67.9 },
      { id: 350, type: "54a", x: 5.9, y: 91.6 },
      { id: 351, type: "54a", x: 12.1, y: 91.7 },
      { id: 352, type: "54a", x: 16.9, y: 91.8 },
      { id: 353, type: "54a", x: 23, y: 91.8 },
      { id: 354, type: "46b", x: 34.5, y: 86.3 },
      { id: 355, type: "46b", x: 41.7, y: 85.9 },
      { id: 356, type: "54b", x: 38.7, y: 92.7 },
      { id: 357, type: "76", x: 55.5, y: 55.8 },
      { id: 358, type: "76", x: 62.2, y: 55.9 },
      { id: 359, type: "76", x: 55.4, y: 92.8 },
      { id: 360, type: "76", x: 62.1, y: 93 },
      { id: 361, type: "66", x: 54.4, y: 73.5 },
      { id: 362, type: "79", x: 61.7, y: 73.2 },
      { id: 363, type: "78", x: 68, y: 57 },
      { id: 364, type: "78", x: 74.8, y: 59.6 },
      { id: 365, type: "78", x: 86.3, y: 59.2 },
      { id: 366, type: "78", x: 86.3, y: 75.9 },
      { id: 367, type: "78", x: 86.2, y: 92.4 },
      { id: 368, type: "78", x: 75.7, y: 90.6 },
      { id: 369, type: "78", x: 68, y: 93.6 },
      { id: 370, type: "65", x: 72.3, y: 55.3 },
      { id: 371, type: "65", x: 83.3, y: 55 },
      { id: 372, type: "65", x: 83.3, y: 71.4 },
      { id: 373, type: "65", x: 83, y: 88.1 },
      { id: 374, type: "65", x: 71.9, y: 89.9 },
      { id: 375, type: "88b", x: 93.1, y: 76 },
      { id: 376, type: "88b", x: 93.2, y: 92.7 },
      { id: 377, type: "88b", x: 93.2, y: 59.9 },
      { id: 378, type: "69b", x: 96.1, y: 55.3 },
      { id: 379, type: "69b", x: 95.8, y: 71.5 },
      { id: 380, type: "69b", x: 95.9, y: 88.3 },
    ],
  },
  ocean_blueocean5: {
    image: "/apt_map/ocean/blueocean5.jpg",
    hotspots: [
      { id: 381, type: "54a", x: 5.2, y: 9.8 },
      { id: 382, type: "54a", x: 12.3, y: 9.9 },
      { id: 383, type: "54a", x: 11.7, y: 36.4 },
      { id: 384, type: "54a", x: 4.9, y: 36.4 },
      { id: 385, type: "66", x: 17, y: 9.6 },
      { id: 386, type: "66", x: 26, y: 12.1 },
      { id: 387, type: "66", x: 17.1, y: 36.6 },
      { id: 388, type: "77", x: 24.3, y: 33.7 },
      { id: 389, type: "46b", x: 35.4, y: 10.4 },
      { id: 390, type: "46b", x: 43.7, y: 10.2 },
      { id: 391, type: "46b", x: 44.4, y: 31.5 },
      { id: 392, type: "46b", x: 36.3, y: 31.7 },
      { id: 393, type: "54b", x: 40.2, y: 16.6 },
      { id: 394, type: "54b", x: 41, y: 38.1 },
      { id: 395, type: "64", x: 24.6, y: 28.8 },
      { id: 396, type: "54a", x: 5, y: 59.4 },
      { id: 397, type: "54a", x: 12, y: 59.5 },
      { id: 398, type: "54a", x: 12.2, y: 75.2 },
      { id: 399, type: "54a", x: 5, y: 75.3 },
      { id: 400, type: "66", x: 17.2, y: 59.4 },
      { id: 401, type: "66", x: 17, y: 75.3 },
      { id: 402, type: "88a", x: 25.2, y: 56.6 },
      { id: 403, type: "88a", x: 25, y: 72.8 },
      { id: 404, type: "88a", x: 38, y: 82.5 },
      { id: 405, type: "88a", x: 47.2, y: 76.5 },
      { id: 406, type: "68a", x: 27.1, y: 51.3 },
      { id: 407, type: "68a", x: 26.8, y: 66.7 },
      { id: 408, type: "68a", x: 25.5, y: 84.3 },
      { id: 409, type: "68a", x: 41.5, y: 77.9 },
      { id: 410, type: "77", x: 45.4, y: 58.8 },
      { id: 411, type: "64", x: 41.3, y: 54.9 },
      { id: 412, type: "88a", x: 5, y: 92.2 },
      { id: 413, type: "88a", x: 15.9, y: 92.4 },
      { id: 414, type: "88a", x: 23.7, y: 90 },
      { id: 415, type: "68a", x: 10.5, y: 95 },
      { id: 416, type: "78", x: 50.8, y: 86.5 },
      { id: 417, type: "88b", x: 53.1, y: 91.2 },
      { id: 418, type: "88a", x: 59.7, y: 90.1 },
      { id: 419, type: "68a", x: 65.1, y: 86.7 },
      { id: 420, type: "77", x: 53.3, y: 74.3 },
      { id: 421, type: "77", x: 62.6, y: 74.3 },
      { id: 422, type: "64", x: 58.1, y: 71.9 },
      { id: 423, type: "78", x: 52.9, y: 58.6 },
      { id: 424, type: "46b", x: 57.4, y: 10.1 },
      { id: 425, type: "46b", x: 65.4, y: 9.8 },
      { id: 426, type: "46b", x: 63.8, y: 31.1 },
      { id: 427, type: "46b", x: 55.7, y: 31.3 },
      { id: 428, type: "54b", x: 62.3, y: 16.9 },
      { id: 429, type: "54b", x: 60.3, y: 37.6 },
      { id: 430, type: "54a", x: 73.9, y: 9.3 },
      { id: 431, type: "54a", x: 80.8, y: 9.1 },
      { id: 432, type: "54a", x: 80.7, y: 33.5 },
      { id: 433, type: "54a", x: 73.9, y: 33.8 },
      { id: 434, type: "66", x: 86, y: 9.2 },
      { id: 435, type: "66", x: 94.5, y: 11.7 },
      { id: 436, type: "66", x: 86.2, y: 33.7 },
      { id: 437, type: "77", x: 92.9, y: 31.3 },
      { id: 438, type: "64", x: 94.3, y: 26.9 },
    ],
  },
  ocean_blueocean6: {
    image: "/apt_map/ocean/blueocean6.jpg",
    hotspots: [
      { id: 439, type: "66", x: 5.6, y: 11.8 },
      { id: 440, type: "66", x: 13.4, y: 9.2 },
      { id: 441, type: "87a", x: 5.7, y: 36.7 },
      { id: 442, type: "87a", x: 15.7, y: 40.1 },
      { id: 443, type: "54a", x: 20.8, y: 40.1 },
      { id: 444, type: "54a", x: 26.7, y: 40.4 },
      { id: 445, type: "46a", x: 18.8, y: 24.5 },
      { id: 446, type: "46a", x: 24.2, y: 24.5 },
      { id: 447, type: "46a", x: 23.4, y: 9.1 },
      { id: 448, type: "46a", x: 18.1, y: 9.2 },
      { id: 449, type: "67a", x: 11, y: 36.9 },
      { id: 450, type: "46b", x: 38.9, y: 8.9 },
      { id: 451, type: "46b", x: 45.9, y: 8.6 },
      { id: 452, type: "46b", x: 45.2, y: 33.3 },
      { id: 453, type: "46b", x: 37.9, y: 33.6 },
      { id: 454, type: "54b", x: 43.1, y: 15 },
      { id: 455, type: "54b", x: 42.2, y: 39.9 },
      { id: 456, type: "66", x: 57.4, y: 6.5 },
      { id: 457, type: "66", x: 64.9, y: 6.5 },
      { id: 458, type: "66", x: 57.3, y: 25.3 },
      { id: 459, type: "78", x: 69, y: 6.6 },
      { id: 460, type: "78", x: 77.7, y: 9.8 },
      { id: 461, type: "78", x: 87.1, y: 9 },
      { id: 462, type: "78", x: 87.1, y: 26.7 },
      { id: 463, type: "78", x: 77.2, y: 36.8 },
      { id: 464, type: "78", x: 68.9, y: 40.8 },
      { id: 465, type: "78", x: 87, y: 44.4 },
      { id: 466, type: "65", x: 74, y: 6.8 },
      { id: 467, type: "65", x: 85.2, y: 4.4 },
      { id: 468, type: "65", x: 85.2, y: 22.2 },
      { id: 469, type: "65", x: 84.8, y: 39.9 },
      { id: 470, type: "65", x: 73.3, y: 38 },
      { id: 471, type: "79", x: 64.7, y: 25.8 },
      { id: 472, type: "76", x: 56.8, y: 40.5 },
      { id: 473, type: "76", x: 64, y: 40.6 },
      { id: 474, type: "88b", x: 93.5, y: 9.3 },
      { id: 475, type: "88b", x: 93.6, y: 27 },
      { id: 476, type: "88b", x: 93.4, y: 44.2 },
      { id: 477, type: "69b", x: 95.7, y: 4 },
      { id: 478, type: "69b", x: 95.5, y: 21.4 },
      { id: 479, type: "69b", x: 95.7, y: 38.5 },
      { id: 480, type: "78", x: 84.7, y: 58.4 },
      { id: 481, type: "69b", x: 93.7, y: 58.4 },
      { id: 482, type: "69b", x: 84.4, y: 69.8 },
      { id: 483, type: "88b", x: 90.4, y: 62.6 },
      { id: 484, type: "88b", x: 82.2, y: 75 },
      { id: 485, type: "87a", x: 75.3, y: 74.7 },
      { id: 486, type: "67a", x: 73.3, y: 70.4 },
      { id: 487, type: "65", x: 84, y: 53.9 },
    ],
  },
};

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

// ── 배치도 뷰 ──
function FloorPlanView({ complex, onBack }: { complex: VRComplex; onBack: () => void }) {
  const key = `${complex.regionId}_${complex.slug}`;
  const plan = FLOOR_PLAN_DATA[key];
  const areaMap = VR_AREA_MAP[key] ?? {};
  const imgRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  if (!plan) {
    // 배치도 없는 단지 → 기존 타입 버튼 방식
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm mb-6">
          <ChevronLeft size={16} /> 목록으로
        </button>
        <h2 className="text-gray-900 text-xl font-bold mb-2">{complex.name}</h2>
        <p className="text-gray-600 text-sm mb-6">배치도 준비 중입니다. 평형을 직접 선택하세요.</p>
        <div className="flex flex-wrap gap-2">
          {complex.types.map((type) => {
            const sqm = areaMap[type];
            const cfg = typeColor(key, type);
            return (
              <button key={type} onClick={() => window.open(getVRUrl(complex.regionId, complex.slug, type), "_blank")}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: cfg.bg, color: cfg.text, border: `2px solid ${cfg.border}` }}>
                {type.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-0 md:p-6 min-h-screen">

      {/* 상단(모바일) / 왼쪽(데스크톱) 패널 */}
      <div className="md:w-72 md:flex-shrink-0 flex flex-col gap-3 px-4 pt-4 md:px-0 md:pt-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm">
          <ChevronLeft size={16} /> 목록으로
        </button>
        <div>
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold mb-1 md:mb-8">{complex.name}</h2>
        </div>
        <div className="hidden md:flex flex-col gap-1.5 mt-6">
          {complex.types.map((type) => {
            const cfg = typeColor(key, type);
            const sqm = areaMap[type];
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }} />
                <span className="text-sm font-semibold text-gray-700">{type.toUpperCase()}{sqm ? ` · ${sqm}㎡` : ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 배치도 */}
      <div className="flex-1 flex flex-col justify-start">
        <p className="text-accent text-base font-bold mb-3 px-4 md:px-0 text-center">배치도에서 면적을 누르면 VR로 연결됩니다.<br />확대하시면 더 편리합니다.</p>
        <div className={`w-full ${COMPLEX_MAX_WIDTH[key] ?? "max-w-4xl"} overflow-hidden rounded-xl`}>
          {(() => {
            const imageContent = (
              <div ref={imgRef} className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plan.image}
                  alt={`${complex.name} 단지 배치도`}
                  className="block w-full"
                  draggable={false}
                />
                {plan.hotspots.map((hs) => {
                  const cfg = typeColor(key, hs.type);
                  const isHovered = hoveredId === hs.id;
                  return (
                    <button
                      key={hs.id}
                      onClick={() => window.open(getVRUrl(complex.regionId, complex.slug, hs.type), "_blank")}
                      onMouseEnter={() => setHoveredId(hs.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      title={`${hs.type.toUpperCase()} VR 보기`}
                      className="absolute rounded-full transition-all duration-150"
                      style={{
                        left: `${hs.x}%`,
                        top: `${hs.y}%`,
                        transform: `translate(-50%, -50%) scale(${isHovered ? 1.7 : 1})`,
                        width: 28,
                        height: 28,
                        background: "transparent",
                        border: isHovered ? `3px solid ${cfg.bg}` : "none",
                        boxShadow: isHovered
                          ? `0 0 0 4px ${cfg.bg}66, 0 0 20px 8px ${cfg.bg}cc, 0 0 40px 12px ${cfg.bg}55`
                          : "none",
                        zIndex: isHovered ? 20 : 10,
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </div>
            );
            return isMobile ? (
              <TransformWrapper minScale={1} maxScale={5} panning={{ velocityDisabled: false }}>
                <TransformComponent wrapperClass="min-h-[70svh]" wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
                  {imageContent}
                </TransformComponent>
              </TransformWrapper>
            ) : imageContent;
          })()}
        </div>
      </div>
    </div>
  );
}

// ── 단지 카드 ──
function ComplexCard({ complex, onSelect }: { complex: VRComplex; onSelect: () => void }) {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = `https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/${complex.regionId}/${complex.slug}/thumb.jpg`;
  const hasPlan = !!FLOOR_PLAN_DATA[`${complex.regionId}_${complex.slug}`];

  return (
    <div className="group bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-36 bg-gradient-to-br from-bg-hover to-bg flex items-center justify-center">
        {imgError ? (
          <Building2 size={40} className="text-border" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={complex.name} className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)} />
        )}
        <button onClick={onSelect} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-white text-sm font-semibold">
            배치도 보기
          </span>
        </button>
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur rounded-lg text-xs text-white font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE VR
        </span>
        {hasPlan && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-medium">
            배치도
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">{complex.name}</h3>
          <span className="text-xs text-green-600">{complex.types.length}개 평형</span>
        </div>
        <button onClick={onSelect}
          className="w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent rounded-xl text-xs font-semibold transition-all">
          배치도 · VR 보기
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──
export default function VRTestPage() {
  const [region, setRegion] = useState("명지오션시티");
  const [selected, setSelected] = useState<VRComplex | null>(null);

  useEffect(() => {
    const onPop = () => {
      if (selected) setSelected(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [selected]);

  function selectComplex(c: VRComplex) {
    setSelected(c);
    window.scrollTo(0, 0);
    window.history.pushState({ vrTest: true }, "");
  }

  function goBack() {
    setSelected(null);
    window.scrollTo(0, 0);
    window.history.back();
  }

  const filtered = complexData.filter((c) => c.regionName === region);

  if (selected) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FloorPlanView complex={selected} onBack={goBack} />
        </div>
        <StoreBanner />
      </>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">VR 가상투어</h1>
        <p className="text-gray-600">단지 배치도에서 원하는 면적을 클릭하면 VR 투어가 시작됩니다.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {regions.map((r) => (
          <button key={r} onClick={() => setRegion(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              region === r ? "bg-accent text-white" : "bg-bg-card border border-border text-gray-700 hover:text-gray-900 hover:border-accent/40"
            }`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <ComplexCard key={c.id} complex={c} onSelect={() => selectComplex(c)} />
        ))}
      </div>
    </div>
    <StoreBanner />
    </>
  );
}
