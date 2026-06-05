"use client";

import { useState, useEffect, useRef } from "react";
import { complexData, VRComplex, getVRUrl } from "@/lib/vrData";
import StoreBanner from "@/components/home/StoreBanner";
import { VR_AREA_MAP } from "@/lib/vrAreaMapping";
import { Building2, ChevronLeft } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { OCEAN_FLOOR_PLAN } from "@/lib/hotspots/ocean";
import { KUKJE_FLOOR_PLAN } from "@/lib/hotspots/kukje";
import { ECODELTA_FLOOR_PLAN } from "@/lib/hotspots/ecodelta";
import type { Hotspot } from "@/lib/hotspots/ocean";

type ColorDef = { bg: string; border: string; text: string };

// ── 단지별 타입 색상 (단지별 설정 우선, 없으면 공통 fallback) ──
const COMPLEX_TYPE_COLOR: Record<string, Record<string, ColorDef>> = {
  ecodelta_jungheung_ecodelta: {
    "33b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "33c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "39a": { bg: "#e74c3c", border: "#c0392b", text: "#fff" },
    "39b": { bg: "#795548", border: "#5d4037", text: "#fff" },
  },
  ecodelta_dietr_first: {
    "34a": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "34b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "34c": { bg: "#1a5276", border: "#154360", text: "#fff" },
    "43a": { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
    "43b": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "43c": { bg: "#d946a8", border: "#b0308a", text: "#fff" },
  },
  ecodelta_dietr_grand: {
    "35a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "35b": { bg: "#ff6b00", border: "#cc4400", text: "#fff" },
    "25a": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "25b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "45a": { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
    "45b": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  },
  ecodelta_theberhill: {
    "33a":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "33a1": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "33ap": { bg: "#d6eaf8", border: "#a9cce3", text: "#333" },
    "33b":  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "33c":  { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "39":   { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "39p":  { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
  },
  ecodelta_prugio_center: {
    "30a": { bg: "#f0c8a0", border: "#c89060", text: "#333" },
    "30b": { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
    "33a": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "33b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "33c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "33d": { bg: "#ffd699", border: "#e8a000", text: "#333" },
    "33e": { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "33f": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "33g": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
    "33t": { bg: "#c8a882", border: "#a07850", text: "#333" },
  },
  ecodelta_elife: {
    "27a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "27b": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "28a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "32a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "32b": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "33a": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "33b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "33c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "33p": { bg: "#ffd699", border: "#e8a000", text: "#333" },
  },
  ecodelta_xi: {
    "28a": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
    "28b": { bg: "#d5d8dc", border: "#aab7b8", text: "#333" },
    "33a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "33b": { bg: "#795548", border: "#5d4037", text: "#fff" },
    "33c": { bg: "#f0c8a0", border: "#c89060", text: "#333" },
    "33d": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "33e": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "33f": { bg: "#1a5276", border: "#154360", text: "#fff" },
  },
  ecodelta_prugio_lin: {
    "33a1": { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "33a2": { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
    "33a3": { bg: "#922b21", border: "#6e2020", text: "#fff" },
    "33a4": { bg: "#795548", border: "#5d4037", text: "#fff" },
    "33b":  { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
    "37":   { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "37t1": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "37t2": { bg: "#1e8449", border: "#145a32", text: "#fff" },
    "38":   { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "40":   { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "42":   { bg: "#f5e642", border: "#c8b800", text: "#333" },
  },
  ecodelta_sujain: {
    "38a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "40a": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "49a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "49b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "49c": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  },
  ecodelta_hoban: {
    "33a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "33b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "33c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  },
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
  kukje_daebang1: {
    "34a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34b": { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  kukje_daebang2: {
    "34a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34b": { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  kukje_posco2: {
    "34a": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "34b": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "32a": { bg: "#fef9c3", border: "#e8d800", text: "#333" },
    "40":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "46":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  kukje_posco3: {
    "34a": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "34b": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "32a": { bg: "#fef9c3", border: "#e8d800", text: "#333" },
    "32b": { bg: "#fef9c3", border: "#e8d800", text: "#333" },
    "40":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "46":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  },
  kukje_samjung: {
    "34a": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "34b": { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "40a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "40b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "45a": { bg: "#ffd699", border: "#e8a000", text: "#333" },
    "45b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
  },
  kukje_thewestern: {
    "31a1": { bg: "#ffd699", border: "#e8a000", text: "#333" },
    "31a2": { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "31b":  { bg: "#fef9c3", border: "#e8d800", text: "#333" },
    "35a1": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "35a2": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "35b":  { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
  },
  kukje_thehill: {
    "33":  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "49a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "49b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "49c": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
  },
  kukje_kumkang3: {
    "25a":  { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "25b":  { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
    "25c":  { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "25c1": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
  },
  kukje_kumkang2: {
    "33a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "33b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "26a": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "26b": { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "26c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  },
  kukje_kumkang1: {
    "34a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "34c": { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "26a": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
    "27b": { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
  },
  kukje_jungheung2: {
    "27":  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "30a": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "30b": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "34":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
  },
  kukje_jungheung1: {
    "25a":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "25a1": { bg: "#f1948a", border: "#c0392b", text: "#fff" },
    "25b":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "25b1": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "25c":  { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "25d":  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "25e":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
  },
  kukje_hyupsung: {
    "22a":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "22a1": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "24b":  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
    "24b1": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
    "24c":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
    "24d":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  },
  kukje_hoban1: {
    "27":  { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "30a": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "30b": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "34":  { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  },
  kukje_hoban2: {
    "33":  { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "28a": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
    "28b": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
    "28c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  },
  kukje_elife: {
    "34a": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "34b": { bg: "#aed6f1", border: "#7fb3d3", text: "#333" },
    "34c": { bg: "#3498db", border: "#2176ae", text: "#fff" },
    "39a": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
    "39b": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
    "39c": { bg: "#f9d0e8", border: "#e8a0c0", text: "#333" },
  },
  kukje_eileen: {
    "26":  { bg: "#ffd699", border: "#e8a000", text: "#333" },
    "29a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
    "29b": { bg: "#a9dfbf", border: "#58d68d", text: "#333" },
    "33a": { bg: "#d7bde2", border: "#a569bd", text: "#333" },
    "33b": { bg: "#3498db", border: "#2176ae", text: "#fff" },
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
  ecodelta_hoban: "max-w-md",
  ecodelta_prugio_lin: "max-w-3xl",
  ecodelta_xi: "max-w-3xl",
  ecodelta_dietr_first: "max-w-2xl",
  ocean_samjung: "max-w-sm",
  ocean_solmare: "max-w-lg",
  kukje_daebang2: "max-w-2xl",
  kukje_eileen: "max-w-3xl",
  kukje_hyupsung: "max-w-2xl",
  kukje_jungheung1: "max-w-2xl",
  kukje_kumkang1: "max-w-2xl",
  kukje_kumkang2: "max-w-3xl",
  kukje_thehill: "max-w-3xl",
  kukje_thewestern: "max-w-3xl",
  kukje_posco2: "max-w-2xl",
  kukje_samjung: "max-w-xs",
  kukje_hoban1: "max-w-3xl",
};

const FLOOR_PLAN_DATA: Record<string, { image: string; hotspots: Hotspot[] }> = { ...OCEAN_FLOOR_PLAN, ...KUKJE_FLOOR_PLAN, ...ECODELTA_FLOOR_PLAN };

const regions = ["명지오션시티", "명지국제신도시", "에코델타시티"];

// VR 존재 여부 캐시 (세션 동안 유지)
const vrCheckCache = new Map<string, boolean>();

async function checkVRExists(url: string): Promise<boolean> {
  if (vrCheckCache.has(url)) return vrCheckCache.get(url)!;
  try {
    const { exists } = await fetch(`/api/vr-check?url=${encodeURIComponent(url)}`).then((r) => r.json());
    vrCheckCache.set(url, exists);
    return exists;
  } catch {
    return true;
  }
}

// ── 배치도 뷰 ──
function FloorPlanView({ complex, onBack }: { complex: VRComplex; onBack: () => void }) {
  const key = `${complex.regionId}_${complex.slug}`;
  const plan = FLOOR_PLAN_DATA[key];
  const areaMap = VR_AREA_MAP[key] ?? {};
  const imgRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showNoVR, setShowNoVR] = useState(false);
  const [noVRTypes, setNoVRTypes] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(true);

  function handleHotspotClick(type: string) {
    if (complex.noVR) {
      setShowNoVR(true);
      setTimeout(() => setShowNoVR(false), 2500);
      return;
    }
    const url = getVRUrl(complex.regionId, complex.slug, type);
    checkVRExists(url).then((exists) => {
      if (exists) {
        window.open(url, "_blank");
      } else {
        setShowNoVR(true);
        setTimeout(() => setShowNoVR(false), 2500);
      }
    });
  }
  useEffect(() => {
    if (complex.noVR) {
      setNoVRTypes(new Set(complex.types));
      return;
    }
    Promise.all(
      complex.types.map((type) =>
        checkVRExists(getVRUrl(complex.regionId, complex.slug, type))
          .then((exists) => ({ type, exists }))
      )
    ).then((results) => {
      setNoVRTypes(new Set(results.filter((r) => !r.exists).map((r) => r.type)));
    });
  }, [complex]);

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
              <button key={type} onClick={() => handleHotspotClick(type)}
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
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold mb-1 md:mb-8 text-center md:text-left">{complex.name}</h2>
        </div>
        <div className="hidden md:flex flex-col gap-1.5 mt-6">
          {complex.types.map((type) => {
            const cfg = typeColor(key, type);
            const sqm = areaMap[type];
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }} />
                <span className="text-sm font-semibold text-gray-700">
                  {type.toUpperCase()}{sqm ? ` · ${sqm}㎡` : ""}
                  {noVRTypes.has(type) && <span className="ml-1 text-xs text-gray-400 font-normal">준비중</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 배치도 */}
      <div className="flex-1 flex flex-col justify-start">
        <p className="text-accent text-base font-bold mb-3 px-4 md:px-0 text-center">배치도에서 면적을 누르면 VR로 연결됩니다.<br />확대하시면 더 편리합니다.</p>
        {showNoVR && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-lg animate-fade-in">
            🚧 VR 준비 중입니다
          </div>
        )}
        <div className={`w-full ${COMPLEX_MAX_WIDTH[key] ?? "max-w-4xl"} mx-auto overflow-hidden rounded-xl`}>
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
                      onClick={() => handleHotspotClick(hs.type)}
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
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                <TransformWrapper minScale={1} maxScale={5} panning={{ velocityDisabled: false }}>
                  <TransformComponent wrapperClass="min-h-[55svh]" wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
                    {imageContent}
                  </TransformComponent>
                </TransformWrapper>
              </div>
            ) : imageContent;
          })()}
        </div>
      </div>
    </div>
  );
}

// ── 단지 카드 ──
function ComplexCard({ complex, vrCount, onSelect }: { complex: VRComplex; vrCount?: number; onSelect: () => void }) {
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
          <span className="text-xs text-green-600">{vrCount !== undefined ? `${vrCount} / ${complex.types.length}개 평형` : `${complex.types.length}개 평형`}</span>
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
  const [vrCounts, setVRCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/vr-counts", { cache: "no-store" })
      .then((r) => r.json())
      .then(setVRCounts)
      .catch(() => {});
  }, []);

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
          <ComplexCard key={c.id} complex={c} vrCount={vrCounts[c.id]} onSelect={() => selectComplex(c)} />
        ))}
      </div>
    </div>
    <StoreBanner />
    </>
  );
}
