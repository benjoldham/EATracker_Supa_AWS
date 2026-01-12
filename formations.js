// formations.js
// Formation presets for FC tracker pitch view
// Uses existing positions only: GK, RB, CB, LB, CDM, CM, CAM, LM, RM, ST

export const FORMATIONS = {

  "3-4-2-1": {
    label: "3-4-2-1",
    areas: `
      ".   .   st   .   ."
      ".   caml .  camr  ."
      "lm  .    .   .    rm"
      ".   .   cdm  .    ."
      ".  cbl  cbm  cbr   ."
      ".   .   gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"st"   },
      { pos:"CAM", area:"caml" },
      { pos:"CAM", area:"camr" },
      { pos:"LM",  area:"lm"   },
      { pos:"RM",  area:"rm"   },
      { pos:"CDM", area:"cdm"  },
      { pos:"CB",  area:"cbl"  },
      { pos:"CB",  area:"cbm"  },
      { pos:"CB",  area:"cbr"  },
      { pos:"GK",  area:"gk"   },
    ]
  },

  "3-5-2": {
    label: "3-5-2",
    areas: `
      ".   stl  .   str   ."
      "lm  .    cam   .   rm"
      ".   cml  .   cmr   ."
      ".  cbl  cbm  cbr   ."
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbm" },
      { pos:"CB",  area:"cbr" },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-1-2-1-2": { // narrow diamond
    label: "4-1-2-1-2",
    areas: `
      ".   stl  .   str   ."
      ".   .   cam   .    ."
      ".   cml  .   cmr   ."
      ".   .   cdm   .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"CDM", area:"cdm" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-1-3-2": {
    label: "4-1-3-2",
    areas: `
      ".   stl  .   str   ."
      "lm  .    .    .   rm"
      ".   .    cm    .    ."
      ".   .   cdm   .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CM",  area:"cm"  },
      { pos:"CDM", area:"cdm" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-1-4-1": {
    label: "4-1-4-1",
    areas: `
      ".   .    st   .    ."
      "lm  cml  .   cmr   rm"
      ".   .   cdm   .    ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"st"  },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"CDM", area:"cdm" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-2-1-3": {
    label: "4-2-1-3",
    areas: `
      ".   lm   st   rm    ."
      ".   .   cam   .    ."
      ".   cml  .   cmr   ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"ST",  area:"st"  },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-2-2-2": {
    label: "4-2-2-2",
    areas: `
      ".   stl  .   str   ."
      ".   caml .  camr   ."
      ".   cml  .   cmr   ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"CAM", area:"caml"},
      { pos:"CAM", area:"camr"},
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-2-3-1": {
    label: "4-2-3-1",
    areas: `
      ".   .    st   .    ."
      "lm  .   cam   .    rm"
      ".   cml  .   cmr   ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"st"  },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-3-1-2": {
    label: "4-3-1-2",
    areas: `
      ".   stl  .   str   ."
      ".   .   cam   .    ."
      ".   cml  cmc  cmr   ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmc" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-3-3": {
    label: "4-3-3",
    areas: `
      "lm   .    st   .   rm"
      ".   cml  cmc  cmr   ."
      ".    .    .    .    ."
      ".    .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"ST",  area:"st"  },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmc" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-4-1-1": {
    label: "4-4-1-1",
    areas: `
      ".   .    st   .    ."
      ".   .   cam   .    ."
      "lm  cml  .   cmr   rm"
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"st"  },
      { pos:"CAM", area:"cam" },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-4-2": {
    label: "4-4-2",
    areas: `
      ".   stl  .   str   ."
      "lm  .    .    .    rm"
      ".   cml  .   cmr   ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "4-5-1": {
    label: "4-5-1",
    areas: `
      ".   .    st   .    ."
      "lm  cml  cam  cmr   rm"
      ".   .    .    .    ."
      ".   .    .    .    ."
      "lb  cbl  .   cbr   rb"
      ".   .    gk   .    ."
    `,
    layout: [
      { pos:"ST",  area:"st"  },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CM",  area:"cml" },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lb"  },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rb"  },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "5-3-2": {
    label: "5-3-2",
    areas: `
      ".   stl  .   str   ."
      ".   .   cam   .    ."
      ".   cml  .   cmr   ."
      "lbw cbl  cbm  cbr  rbw"
      ".   .    gk   .    ."
      ".   .    .    .    ."
    `,
    layout: [
      { pos:"ST",  area:"stl" },
      { pos:"ST",  area:"str" },
      { pos:"CAM", area:"cam" },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lbw" },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbm" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rbw" },
      { pos:"GK",  area:"gk"  },
    ]
  },

  "5-4-1": {
    label: "5-4-1",
    areas: `
      ".   .    st   .    ."
      "lm  cml  .   cmr   rm"
      ".   .    .    .    ."
      "lbw cbl  cbm  cbr  rbw"
      ".   .    gk   .    ."
      ".   .    .    .    ."
    `,
    layout: [
      { pos:"ST",  area:"st"  },
      { pos:"LM",  area:"lm"  },
      { pos:"RM",  area:"rm"  },
      { pos:"CM",  area:"cml" },
      { pos:"CM",  area:"cmr" },
      { pos:"LB",  area:"lbw" },
      { pos:"CB",  area:"cbl" },
      { pos:"CB",  area:"cbm" },
      { pos:"CB",  area:"cbr" },
      { pos:"RB",  area:"rbw" },
      { pos:"GK",  area:"gk"  },
    ]
  },

};

export const DEFAULT_FORMATION = "4-2-3-1";

export function getFormationOptions(){
  return Object.entries(FORMATIONS).map(([key, f])=>({
    key,
    label: f.label || key
  }));
}
