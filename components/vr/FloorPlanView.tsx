"use client";

import { useState, useEffect, useRef } from "react";
import { VRComplex, getVRUrl } from "@/lib/vrData";
import { VR_AREA_MAP } from "@/lib/vrAreaMapping";
import { APT_COMPLEXES } from "@/lib/mapData";
import { ChevronLeft } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { OCEAN_FLOOR_PLAN } from "@/lib/hotspots/ocean";
import { KUKJE_FLOOR_PLAN } from "@/lib/hotspots/kukje";
import { ECODELTA_FLOOR_PLAN } from "@/lib/hotspots/ecodelta";
import type { Hotspot } from "@/lib/hotspots/ocean";

type ColorDef = { bg: string; border: string; text: string };

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

const TYPE_COLOR: Record<string, ColorDef> = {
  "28":  { bg: "#d946a8", border: "#b0308a", text: "#fff" },
  "29":  { bg: "#e879b0", border: "#c0508a", text: "#fff" },
  "29a": { bg: "#e879b0", border: "#c0508a", text: "#fff" },
  "29b": { bg: "#f0a0cc", border: "#d070a0", text: "#333" },
  "31":  { bg: "#ff6b6b", border: "#cc4444", text: "#fff" },
  "32":  { bg: "#ff9494", border: "#dd6060", text: "#fff" },
  "33a": { bg: "#f5e642", border: "#c8b800", text: "#333" },
  "33b": { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "33c": { bg: "#1ec8c8", border: "#0aa0a0", text: "#fff" },
  "33d": { bg: "#4a9eff", border: "#2070cc", text: "#fff" },
  "33e": { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  "34a": { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
  "34b": { bg: "#ffc04a", border: "#e89000", text: "#333" },
  "34c": { bg: "#2ecc71", border: "#1a8a4a", text: "#fff" },
  "36":  { bg: "#27ae60", border: "#1e8449", text: "#fff" },
  "36a": { bg: "#52d98a", border: "#28a85a", text: "#333" },
  "36b": { bg: "#82e8a8", border: "#48c070", text: "#333" },
  "38":  { bg: "#e74c3c", border: "#c0392b", text: "#fff" },
  "39":  { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "39a": { bg: "#7be83a", border: "#4ab810", text: "#333" },
  "39b": { bg: "#1abc9c", border: "#148f77", text: "#fff" },
  "39c": { bg: "#4a9eff", border: "#2070cc", text: "#fff" },
  "39d": { bg: "#3498db", border: "#2176ae", text: "#fff" },
  "42":  { bg: "#16a085", border: "#117a65", text: "#fff" },
  "43":  { bg: "#9b59b6", border: "#7d3c98", text: "#fff" },
  "46a": { bg: "#2980b9", border: "#1f618d", text: "#fff" },
  "46b": { bg: "#5dade2", border: "#2e86c1", text: "#fff" },
  "46c": { bg: "#85c1e9", border: "#5499c7", text: "#333" },
  "49":  { bg: "#ff85c2", border: "#d45e99", text: "#fff" },
  "54":  { bg: "#8e44ad", border: "#6c3483", text: "#fff" },
  "54a": { bg: "#a569bd", border: "#7d3c98", text: "#fff" },
  "54b": { bg: "#c39bd3", border: "#9b59b6", text: "#333" },
  "55":  { bg: "#e67e22", border: "#ca6f1e", text: "#fff" },
  "59":  { bg: "#a855f7", border: "#7c3aed", text: "#fff" },
  "64":  { bg: "#17a589", border: "#0e7863", text: "#fff" },
  "65":  { bg: "#d4ac0d", border: "#a08000", text: "#fff" },
  "66":  { bg: "#f39c12", border: "#c87d0e", text: "#fff" },
  "67a": { bg: "#ca6f1e", border: "#a04000", text: "#fff" },
  "68a": { bg: "#dc7633", border: "#b8500a", text: "#fff" },
  "69b": { bg: "#f0a500", border: "#cc8800", text: "#333" },
  "76":  { bg: "#c0392b", border: "#922b21", text: "#fff" },
  "77":  { bg: "#e74c3c", border: "#c0392b", text: "#fff" },
  "78":  { bg: "#922b21", border: "#6e2020", text: "#fff" },
  "79":  { bg: "#d98880", border: "#a93226", text: "#fff" },
  "85":  { bg: "#ff8c00", border: "#cc6600", text: "#fff" },
  "87":  { bg: "#7f8c8d", border: "#616a6b", text: "#fff" },
  "87a": { bg: "#95a5a6", border: "#717d7e", text: "#333" },
  "87b": { bg: "#aab7b8", border: "#808b8c", text: "#333" },
  "88a": { bg: "#566573", border: "#3d4f5c", text: "#fff" },
  "88b": { bg: "#717d7e", border: "#5d6d7e", text: "#fff" },
};

export function typeColor(complexKey: string, type: string): ColorDef {
  return COMPLEX_TYPE_COLOR[complexKey]?.[type] ?? TYPE_COLOR[type] ?? { bg: "#888", border: "#555", text: "#fff" };
}

export const COMPLEX_MAX_WIDTH: Record<string, string> = {
  ecodelta_hoban: "max-w-md",
  ecodelta_prugio_lin: "max-w-3xl",
  ecodelta_xi: "max-w-3xl",
  ecodelta_dietr_first: "max-w-2xl",
  ocean_samjung: "max-w-lg",
  ocean_solmare: "max-w-2xl",
  kukje_daebang2: "max-w-2xl",
  kukje_eileen: "max-w-3xl",
  kukje_hyupsung: "max-w-2xl",
  kukje_jungheung1: "max-w-2xl",
  kukje_kumkang1: "max-w-2xl",
  kukje_kumkang2: "max-w-3xl",
  kukje_thehill: "max-w-3xl",
  kukje_thewestern: "max-w-3xl",
  kukje_posco2: "max-w-3xl",
  kukje_posco3: "max-w-5xl",
  kukje_samjung: "max-w-xs",
  kukje_hoban1: "max-w-3xl",
};

export const FLOOR_PLAN_DATA: Record<string, { image: string; hotspots: Hotspot[] }> = {
  ...OCEAN_FLOOR_PLAN,
  ...KUKJE_FLOOR_PLAN,
  ...ECODELTA_FLOOR_PLAN,
};

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

export default function FloorPlanView({ complex, onBack }: { complex: VRComplex; onBack: () => void }) {
  const key = `${complex.regionId}_${complex.slug}`;
  const plan = FLOOR_PLAN_DATA[key];
  const areaMap = VR_AREA_MAP[key] ?? {};
  const imgRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [showNoVR, setShowNoVR] = useState(false);
  const [noVRTypes, setNoVRTypes] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(true);
  const [showPinchHint, setShowPinchHint] = useState(true);

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
                {type.toUpperCase()}{sqm ? ` · ${sqm}㎡` : ""}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-6 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-base font-medium px-4 pt-4 md:px-0 md:pt-0 mb-4">
        <ChevronLeft size={16} /> 목록으로
      </button>
    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
      <div className="md:w-72 md:flex-shrink-0 flex flex-col gap-3 px-4 md:px-0">
        <div>
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">{complex.name}</h2>
          <p className="text-accent text-base font-bold text-center md:text-left">배치도에서 면적을 누르면 VR로 연결됩니다.</p>
        </div>
        {(() => {
          const apt = APT_COMPLEXES.find((a) => a.id === complex.id);
          if (!apt) return null;
          const rows = [
            apt.address      && { label: "주소",         value: apt.address },
            apt.hoCnt        && { label: "세대수",        value: `${apt.hoCnt.toLocaleString()}세대` },
            apt.buildYear    && { label: "건축연도",      value: `${apt.buildYear}년` },
            apt.dongCnt      && { label: "동수",          value: `${apt.dongCnt}개동` },
            apt.heatType     && { label: "난방방식",      value: apt.heatType },
            apt.evChargerCnt && { label: "전기차충전기",  value: `${apt.evChargerCnt}기` },
            apt.officeTel    && { label: "관리사무소",    value: apt.officeTel, href: `tel:${apt.officeTel}` },
          ].filter(Boolean) as { label: string; value: string; href?: string }[];
          if (rows.length === 0) return null;
          return (
            <div className="hidden md:block mt-4 rounded-xl border border-border bg-bg-card overflow-hidden text-sm">
              {rows.map(({ label, value, href }) => (
                <div key={label} className="flex items-start justify-between gap-3 px-4 py-2.5 border-b border-border last:border-b-0">
                  <span className="text-gray-500 shrink-0">{label}</span>
                  {href
                    ? <a href={href} className="font-semibold text-blue-600 hover:underline text-right">{value}</a>
                    : <span className="font-semibold text-gray-900 text-right">{value}</span>
                  }
                </div>
              ))}
            </div>
          );
        })()}
        {(() => {
          const twoCol = ["ocean_blueocean4", "ocean_blueocean5", "ocean_blueocean6", "ocean_qweendom_lincoln"].includes(key);
          return (
          <div className="hidden md:block mt-3 rounded-xl border border-border bg-bg-card overflow-hidden text-sm">
            <div className="px-4 py-2.5 border-b border-border">
              <span className="text-xs text-gray-400 font-medium">평형 범례</span>
            </div>
            <div className={twoCol ? "grid grid-cols-2" : ""}>
              {complex.types.map((type) => {
                const cfg = typeColor(key, type);
                const sqm = areaMap[type];
                return (
                  <div key={type}
                    className="flex items-center justify-between px-3 py-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-bg-hover transition-colors"
                    onMouseEnter={() => setHoveredType(type)}
                    onMouseLeave={() => setHoveredType(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }} />
                      <span className="text-sm font-semibold text-gray-700">{type.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sqm && <span className="text-sm text-gray-600">{sqm.toFixed(2)}㎡</span>}
                      {noVRTypes.has(type) && <span className="text-xs text-gray-400">준비중</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })()}
      </div>

      <div className="flex-1 flex flex-col justify-start">
        <p className="md:hidden text-accent text-sm font-bold mb-3 px-4 text-center"><span className="opacity-50">✦</span> 확대하시면 더 편리합니다. <span className="opacity-50">✦</span></p>
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
                  const isHovered = hoveredId === hs.id || hoveredType === hs.type;
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
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden relative">
                <TransformWrapper minScale={1} maxScale={5} panning={{ velocityDisabled: false }}
                  onPinchStart={() => setShowPinchHint(false)}
                >
                  <TransformComponent wrapperClass="min-h-[55svh]" wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
                    {imageContent}
                  </TransformComponent>
                </TransformWrapper>
                {showPinchHint && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ animation: "pinch-fade 2s ease 3 forwards" }}
                    onAnimationEnd={() => setShowPinchHint(false)}
                  >
                    <div className="relative w-24 h-24">
                      {/* 왼쪽 손가락 */}
                      <div
                        className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full bg-white/80 border-2 border-gray-400 shadow-lg flex items-center justify-center text-3xl"
                        style={{ animation: "pinch-left 2s ease 3 forwards" }}
                      >
                        👆
                      </div>
                      {/* 오른쪽 손가락 */}
                      <div
                        className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full bg-white/80 border-2 border-gray-400 shadow-lg flex items-center justify-center text-3xl"
                        style={{ animation: "pinch-right 2s ease 3 forwards" }}
                      >
                        👆
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : imageContent;
          })()}
        </div>
      </div>
    </div>
    </div>
  );
}
