// src/data/diseaseRecommendations.ts
export interface DiseaseRecommendation {
  diseaseName: string;
  description: string;
  symptoms: string[];
  treatment: {
    organic: string[];
    chemical: string[];
  };
  prevention: string[];
}

export const diseaseRecommendations: Record<string, DiseaseRecommendation> = {
  "Anthracnose": {
    diseaseName: "Anthracnose",
    description: "A fungal disease that causes dark, sunken lesions on leaves, stems, and fruit.",
    symptoms: [
      "Dark, sunken lesions on leaves",
      "Circular spots with concentric rings",
      "Premature leaf drop",
      "Fruit rot in severe cases"
    ],
    treatment: {
      organic: [
        "Remove and destroy infected plant parts",
        "Improve air circulation",
        "Apply copper-based fungicide",
        "Use neem oil spray"
      ],
      chemical: [
        "Chlorothalonil fungicide",
        "Mancozeb fungicide",
        "Follow label instructions carefully"
      ]
    },
    prevention: [
      "Avoid overhead watering",
      "Prune for better air circulation",
      "Remove fallen leaves and debris",
      "Plant resistant varieties when available"
    ]
  },

  "Bacterial_Blight": {
    diseaseName: "Bacterial Blight",
    description: "A bacterial disease that causes water-soaked lesions and leaf spots.",
    symptoms: [
      "Water-soaked lesions on leaves",
      "Yellow halos around spots",
      "Leaf wilting and drop",
      "Stem cankers"
    ],
    treatment: {
      organic: [
        "Remove infected plant parts",
        "Apply copper-based bactericide",
        "Improve drainage",
        "Use resistant varieties"
      ],
      chemical: [
        "Copper-based bactericides",
        "Streptomycin (if available)",
        "Follow manufacturer instructions"
      ]
    },
    prevention: [
      "Avoid overhead watering",
      "Disinfect pruning tools",
      "Improve soil drainage",
      "Plant resistant varieties"
    ]
  },

  "Black_Spot": {
    diseaseName: "Black Spot",
    description: "A fungal disease characterized by black spots on leaves.",
    symptoms: [
      "Black circular spots on leaves",
      "Yellowing around spots",
      "Premature leaf drop",
      "Reduced plant vigor"
    ],
    treatment: {
      organic: [
        "Remove infected leaves",
        "Apply copper fungicide",
        "Use baking soda spray",
        "Improve air circulation"
      ],
      chemical: [
        "Chlorothalonil fungicide",
        "Myclobutanil fungicide",
        "Follow label directions"
      ]
    },
    prevention: [
      "Avoid wetting leaves",
      "Prune for air circulation",
      "Remove fallen leaves",
      "Plant resistant varieties"
    ]
  },

  "Canker": {
    diseaseName: "Canker",
    description: "A bacterial or fungal disease causing sunken lesions on stems and branches.",
    symptoms: [
      "Sunken lesions on stems",
      "Gum oozing from wounds",
      "Branch dieback",
      "Reduced fruit production"
    ],
    treatment: {
      organic: [
        "Prune infected branches",
        "Apply copper fungicide",
        "Improve drainage",
        "Use wound sealant"
      ],
      chemical: [
        "Copper-based fungicides",
        "Thiophanate-methyl",
        "Follow safety instructions"
      ]
    },
    prevention: [
      "Avoid mechanical damage",
      "Disinfect pruning tools",
      "Improve soil drainage",
      "Plant resistant varieties"
    ]
  },

  "Curl_Virus": {
    diseaseName: "Curl Virus",
    description: "A viral disease that causes leaf curling and distortion.",
    symptoms: [
      "Leaf curling and distortion",
      "Yellowing of leaves",
      "Stunted growth",
      "Reduced fruit quality"
    ],
    treatment: {
      organic: [
        "Remove infected plants",
        "Control aphid vectors",
        "Use resistant varieties",
        "Improve plant nutrition"
      ],
      chemical: [
        "Insecticides for aphid control",
        "Systemic treatments",
        "Follow label instructions"
      ]
    },
    prevention: [
      "Control aphid populations",
      "Use virus-free planting material",
      "Remove weeds",
      "Plant resistant varieties"
    ]
  },

  "Deficiency": {
    diseaseName: "Nutrient Deficiency",
    description: "A condition caused by lack of essential nutrients in the soil.",
    symptoms: [
      "Yellowing of leaves",
      "Stunted growth",
      "Poor fruit development",
      "Leaf drop"
    ],
    treatment: {
      organic: [
        "Apply compost",
        "Use organic fertilizers",
        "Test soil pH",
        "Add specific nutrients"
      ],
      chemical: [
        "Balanced NPK fertilizer",
        "Micronutrient supplements",
        "Follow soil test recommendations"
      ]
    },
    prevention: [
      "Regular soil testing",
      "Balanced fertilization",
      "Proper pH maintenance",
      "Organic matter addition"
    ]
  },

  "Dry_Leaf": {
    diseaseName: "Dry Leaf",
    description: "A condition caused by water stress or environmental factors.",
    symptoms: [
      "Dry, brittle leaves",
      "Leaf curling",
      "Brown leaf edges",
      "Premature leaf drop"
    ],
    treatment: {
      organic: [
        "Increase watering frequency",
        "Improve soil moisture retention",
        "Add mulch",
        "Provide shade"
      ],
      chemical: [
        "Water-soluble fertilizers",
        "Anti-transpirants",
        "Follow application rates"
      ]
    },
    prevention: [
      "Consistent watering schedule",
      "Mulch around plants",
      "Provide adequate shade",
      "Improve soil structure"
    ]
  },

  "Greening": {
    diseaseName: "Citrus Greening (Huanglongbing)",
    description: "A bacterial disease transmitted by psyllids that causes yellowing and misshapen fruit.",
    symptoms: [
      "Yellowing of leaves",
      "Misshapen fruit",
      "Bitter fruit taste",
      "Tree decline"
    ],
    treatment: {
      organic: [
        "Remove infected trees",
        "Control psyllid vectors",
        "Use resistant rootstocks",
        "Improve tree nutrition"
      ],
      chemical: [
        "Psyllid insecticides",
        "Systemic treatments",
        "Follow integrated pest management"
      ]
    },
    prevention: [
      "Control psyllid populations",
      "Use disease-free planting material",
      "Regular monitoring",
      "Remove infected trees immediately"
    ]
  },

  "Healthy": {
    diseaseName: "Healthy",
    description: "Your lemon tree appears to be in good health!",
    symptoms: [
      "Green, vibrant leaves",
      "Normal growth patterns",
      "No visible damage",
      "Good fruit development"
    ],
    treatment: {
      organic: [
        "Continue current care routine",
        "Regular watering",
        "Balanced fertilization",
        "Pruning maintenance"
      ],
      chemical: []
    },
    prevention: [
      "Regular monitoring",
      "Proper watering (deep, infrequent)",
      "Adequate sunlight (6-8 hours daily)",
      "Well-draining soil",
      "Regular pruning for air circulation"
    ]
  },

  "Sooty_Mould": {
    diseaseName: "Sooty Mould",
    description: "A fungal growth that appears as black coating on leaves, usually caused by honeydew from insects.",
    symptoms: [
      "Black, sooty coating on leaves",
      "Reduced photosynthesis",
      "Sticky honeydew present",
      "Insect activity visible"
    ],
    treatment: {
      organic: [
        "Control insect pests",
        "Wash leaves with soapy water",
        "Apply neem oil",
        "Improve air circulation"
      ],
      chemical: [
        "Insecticidal soap",
        "Horticultural oil",
        "Follow label instructions"
      ]
    },
    prevention: [
      "Control aphids and scale insects",
      "Regular plant inspection",
      "Maintain plant health",
      "Use beneficial insects"
    ]
  },

  "Spider_Mites": {
    diseaseName: "Spider Mites",
    description: "Tiny arachnids that feed on plant sap, causing yellowing and stippling on leaves.",
    symptoms: [
      "Yellow or bronze stippling on leaves",
      "Fine webbing on undersides of leaves",
      "Leaves may curl or drop prematurely",
      "Visible tiny moving dots (mites)"
    ],
    treatment: {
      organic: [
        "Spray with water to dislodge mites",
        "Apply neem oil spray every 7-10 days",
        "Introduce beneficial insects like ladybugs",
        "Use insecticidal soap"
      ],
      chemical: [
        "Miticide sprays (use as last resort)",
        "Follow label instructions carefully"
      ]
    },
    prevention: [
      "Maintain proper humidity levels",
      "Regularly inspect plants",
      "Avoid overcrowding plants",
      "Keep plants well-watered"
    ]
  },

  "undetermined": {
    diseaseName: "Undetermined",
    description: "Unable to determine the specific condition from the provided image.",
    symptoms: [
      "Image may be unclear or out of focus",
      "Symptoms not clearly visible",
      "Multiple possible conditions"
    ],
    treatment: {
      organic: [
        "Take a clearer, well-lit photo",
        "Focus on affected areas",
        "Consult with local agricultural extension"
      ],
      chemical: []
    },
    prevention: [
      "Use high-resolution images",
      "Ensure good lighting",
      "Capture close-up of affected areas",
      "Monitor plant regularly"
    ]
  }
};

export function getDiseaseRecommendation(diseaseName: string): DiseaseRecommendation {
  const lowerName = diseaseName.toLowerCase();
  
  // Try exact match first
  if (diseaseRecommendations[diseaseName]) {
    return diseaseRecommendations[diseaseName];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(diseaseRecommendations)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return value;
    }
  }
  
  // Default fallback
  return diseaseRecommendations["undetermined"];
}
