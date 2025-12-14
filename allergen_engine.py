import re
import json
import difflib
from unicodedata import normalize as ud_normalize
from typing import List, Dict, Any

# =============================================================================
# 1. THE ALLERGEN DATABASE (Personalized Risks)
# =============================================================================
ALLERGEN_ONTOLOGY = {
    # --- TOP 9 (Global Standards) ---
    "milk": {
        "labels": ["Milk", "Dairy"],
        "terms": ["milk", "cream", "butter", "cheese", "yogurt", "ghee", "curd", "paneer", "kefir", "koumiss"],
        "aliases": ["whey", "casein", "caseinate", "sodium caseinate", "lactalbumin", "lactoglobulin", "lactose", "milk solids", "dairy solids", "hydrolyzed whey", "recoldent", "tagatose", "nisin", "e234"]
    },
    "egg": {
        "labels": ["Egg"],
        "terms": ["egg", "eggs", "mayonnaise", "meringue", "surimi"],
        "aliases": ["albumin", "ovalbumin", "ovomucoid", "lysozyme", "globulin", "lecithin (egg)", "egg white", "egg yolk", "livetin", "vitellin", "e1105"]
    },
    "peanut": {
        "labels": ["Peanut"],
        "terms": ["peanut", "peanuts", "groundnut", "goober", "monkey nut"],
        "aliases": ["peanut butter", "peanut oil", "peanut flour", "arachis", "arachis oil", "mandalona", "nu-nuts"]
    },
    "tree_nut": {
        "labels": ["Tree Nut"],
        "terms": ["almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut", "macadamia", "chestnut", "pine nut", "brazil nut", "pignoli", "filbert"],
        "aliases": ["nut paste", "marzipan", "praline", "nut oil", "gianduja", "nangai", "shea nut", "ginkgo nut", "lichi", "pili nut"]
    },
    "soy": {
        "labels": ["Soy", "Soya"],
        "terms": ["soy", "soya", "soybean", "tofu", "edamame", "tempeh", "miso", "natto", "shoyu", "tamari"],
        "aliases": ["soy lecithin", "vegetable protein", "tvp", "textured vegetable protein", "soy flour", "soy isolate", "glycine max", "okara", "yuba"]
    },
    "wheat_gluten": {
        "labels": ["Wheat", "Gluten"],
        "terms": ["wheat", "gluten", "barley", "rye", "oats", "spelt", "kamut", "semolina", "durum", "farina", "bulgur", "couscous", "seitan", "triticale", "matzoh"],
        "aliases": ["malt", "malt extract", "hydrolyzed wheat protein", "gliadin", "glutenin", "wheat starch", "bran", "germ", "farro", "emmer", "einkorn", "graham flour", "udonn", "wheatgrass"]
    },
    "fish": {
        "labels": ["Fish"],
        "terms": ["fish", "salmon", "tuna", "cod", "anchovy", "sardine", "tilapia", "trout", "haddock", "herring", "mackerel", "mahi mahi", "snapper", "bass", "flounder"],
        "aliases": ["fish oil", "fish sauce", "isinglass", "gelatin (fish)", "surimi", "caviar", "roe", "worcestershire sauce", "e441"]
    },
    "shellfish": {
        "labels": ["Shellfish", "Crustacean"],
        "terms": ["shrimp", "crab", "lobster", "prawn", "crayfish", "krill", "crawfish", "langoustine", "scampi"],
        "aliases": ["glucosamine", "chitin", "chitosan", "shellfish extract", "barnacle"]
    },
    "mollusk": {
        "labels": ["Mollusk"],
        "terms": ["clam", "mussel", "oyster", "scallop", "squid", "octopus", "calamari", "snail", "escargot", "abalone", "conch", "whelk"],
        "aliases": ["cephalopod", "bivalve"]
    },
    "sesame": {
        "labels": ["Sesame"],
        "terms": ["sesame", "tahini", "halvah"],
        "aliases": ["sesame oil", "sesame seed", "gingelly", "til", "benne", "sim sim", "sesamol", "sesamum indicum"]
    },
    
    # --- EU / UK STANDARDS (Often Missed) ---
    "mustard": {
        "labels": ["Mustard"],
        "terms": ["mustard"],
        "aliases": ["mustard seed", "mustard flour", "mustard oil", "dijon", "sinapis", "brassica"]
    },
    "celery": {
        "labels": ["Celery"],
        "terms": ["celery", "celeriac"],
        "aliases": ["celery salt", "celery seed", "celery root", "apium graveolens"]
    },
    "lupin": {
        "labels": ["Lupin"],
        "terms": ["lupin", "lupine", "lupini"],
        "aliases": ["lupin flour", "lupinus"]
    },
    "sulfite": {
        "labels": ["Sulfites"],
        "terms": ["sulfite", "sulphite", "sulfur dioxide"],
        "aliases": ["metabisulfite", "sodium bisulfite", "potassium bisulfite", "e220", "e221", "e222", "e223", "e224", "e225", "e226", "e227", "e228"]
    },

    # --- OTHER COMMON SENSITIVITIES ---
    "corn": {
        "labels": ["Corn"],
        "terms": ["corn", "maize", "popcorn", "polenta", "hominy", "grits"],
        "aliases": ["corn syrup", "corn starch", "maltodextrin", "dextrose", "high fructose corn syrup", "hfcs", "corn oil", "zein", "modified food starch"]
    },
    "red_meat": {
        "labels": ["Red Meat (Alpha-gal)"],
        "terms": ["beef", "pork", "lamb", "mutton", "veal", "venison", "rabbit", "goat", "bison"],
        "aliases": ["gelatin", "tallow", "lard", "suet", "collagen", "rennet"]
    },
    "nightshade": {
        "labels": ["Nightshade"],
        "terms": ["tomato", "potato", "eggplant", "aubergine", "pepper", "paprika", "chili", "cayenne"],
        "aliases": ["capsicum", "solanum", "goji berry", "tomatillo"]
    },
    "latex_fruit": {
        "labels": ["Latex-Fruit Syndrome"],
        "terms": ["avocado", "banana", "kiwi", "chestnut", "papaya"],
        "aliases": ["latex cross-reactivity"]
    }
}

# =============================================================================
# 2. THE HAZARD PROTOCOL (Cancer, Toxicity, Banned Substances)
# =============================================================================
HAZARD_ONTOLOGY = {
    # --- KNOWN CARCINOGENS (Group 1 & 2A/2B) ---
    "nitrates": {
        "label": "Nitrates / Nitrites",
        "terms": ["sodium nitrate", "sodium nitrite", "potassium nitrate", "potassium nitrite", "e250", "e251", "e252"],
        "danger": "Linked to colorectal cancer (WHO Group 1 Carcinogen). Common in processed meats."
    },
    "bromate": {
        "label": "Potassium Bromate",
        "terms": ["potassium bromate", "bromated flour", "e924", "e924a"],
        "danger": "Group 2B Carcinogen. Banned in Europe, Canada, and China. Damages DNA."
    },
    "titanium_dioxide": {
        "label": "Titanium Dioxide (Whitener)",
        "terms": ["titanium dioxide", "e171", "ci 77891"],
        "danger": "Genotoxic (damages DNA). Banned in the EU as a food additive."
    },
    "bha_bht": {
        "label": "BHA / BHT (Preservatives)",
        "terms": ["butylated hydroxyanisole", "butylated hydroxytoluene", "bha", "bht", "e320", "e321"],
        "danger": "Possible human carcinogen & endocrine disruptor. Affects hormones and liver."
    },
    "propyl_paraben": {
        "label": "Propyl Paraben",
        "terms": ["propyl paraben", "propylparaben", "e216", "sodium propyl p-hydroxybenzoate"],
        "danger": "Strong endocrine disruptor. Linked to breast cancer and reproductive issues."
    },
    "azodicarbonamide": {
        "label": "Azodicarbonamide (ADA)",
        "terms": ["azodicarbonamide", "e927a"],
        "danger": "Respiratory sensitizer. Breaks down into urethane (carcinogen). Known as the 'Yoga Mat Chemical'."
    },

    # --- CONTROVERSIAL ADDITIVES & DYES ---
    "red_dye_3": {
        "label": "Red Dye 3 (Erythrosine)",
        "terms": ["red 3", "red dye 3", "erythrosine", "e127"],
        "danger": "Linked to thyroid tumors. Banned in cosmetics, but legal in food in some regions."
    },
    "red_dye_40": {
        "label": "Red Dye 40 (Allura Red)",
        "terms": ["red 40", "red dye 40", "allura red", "e129"],
        "danger": "Contains benzidine (carcinogen). Linked to ADHD/hyperactivity in children."
    },
    "yellow_dyes": {
        "label": "Yellow 5 / Yellow 6",
        "terms": ["yellow 5", "yellow 6", "tartrazine", "sunset yellow", "e102", "e110"],
        "danger": "Linked to hyperactivity, asthma, and DNA damage. Banned in Norway/Austria."
    },
    "aspartame": {
        "label": "Aspartame",
        "terms": ["aspartame", "nutrasweet", "equal", "e951"],
        "danger": "WHO classified as 'Possible Carcinogen' (Group 2B). Controversial artificial sweetener."
    },
    "tbhq": {
        "label": "TBHQ",
        "terms": ["tbhq", "tertiary butylhydroquinone", "e319"],
        "danger": "Linked to immune system damage and vision disturbances at high doses."
    },
    
    # --- UNHEALTHY FATS ---
    "hydrogenated_oils": {
        "label": "Partially Hydrogenated Oils",
        "terms": ["partially hydrogenated", "shortening", "hydrogenated vegetable oil"],
        "danger": "The primary source of Artificial Trans Fats. Increases heart disease risk significantly."
    },
    "palm_oil": {
        "label": "Palm Oil (Environmental/Health)",
        "terms": ["palm oil", "palmolein", "palm kernel oil", "sodium laureth sulfate", "palmitate"],
        "danger": "High in saturated fats. Environmental concern (deforestation). Often processed with carcinogens (3-MCPD)."
    },

    # --- FOREVER CHEMICALS (PFAS) ---
    "pfas": {
        "label": "PFAS / PTFE",
        "terms": ["ptfe", "polytetrafluoroethylene", "perfluorooctanoic"],
        "danger": "Synthetic 'Forever Chemicals'. Linked to kidney cancer, liver damage, and fertility issues."
    }
}

# =============================================================================
# 3. TEXT NORMALIZATION ENGINE
# =============================================================================
def normalize_text(text: str) -> str:
    """Cleans OCR errors (1->i, 0->o, etc) to ensure accurate matching."""
    if not text: return ""
    text = text.lower()
    # Leetspeak fix for OCR
    replacements = {"1": "i", "0": "o", "|": "l", "@": "a", "(": "", ")": "", "[": "", "]": "", "{": "", "}": ""}
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Remove non-alphanumeric but keep spaces/commas
    text = re.sub(r'[^a-z0-9, \n]', '', text)
    return text.strip()

def extract_ingredients_section(ocr_text: str) -> str:
    if not ocr_text: return ""
    lines = ocr_text.split('\n')
    
    # IMPROVED REGEX: Captures "INGIEDIENTS", "INGREDENTS", "INGREDIEN T S"
    # The [i1l] matches I, 1, or l. The .* allows for spaces/typos in the middle.
    header_pattern = re.compile(r'([i1l]n.*gr[ea]d.*ents?|contains|composition)', re.IGNORECASE)
    
    stop_words = ["nutrition", "produced", "manufactured", "mfg", "exp", "net weight", "best before"]
    
    start_index = -1
    for i, line in enumerate(lines):
        if header_pattern.search(line):
            start_index = i
            break
            
    # If no header found, use the whole text (Fallback)
    if start_index == -1: 
        return normalize_text(ocr_text)

    # Combine lines starting from the header
    relevant_text = []
    for line in lines[start_index:]:
        if any(stop in line.lower() for stop in stop_words): break
        relevant_text.append(line)
        
    return " ".join(relevant_text)

def split_ingredients_list(text: str) -> List[str]:
    # 1. Normalize (Fix I/1, O/0)
    text = normalize_text(text)
    
    # 2. CRITICAL FIX: Add space after commas if missing (e.g. "Maltose,Corn" -> "Maltose, Corn")
    text = re.sub(r',(?=\S)', ', ', text)
    
    # 3. Replace 'and' with comma
    text = re.sub(r'\s+and\s+', ', ', text)
    
    # 4. Split
    items = [x.strip() for x in text.split(',') if len(x.strip()) > 1]
    return items
# =============================================================================
# 4. CORE DETECTION LOGIC
# =============================================================================
def detect_allergens_from_ingredient_items(items: List[str], user_allergens: List[str]) -> Dict[str, Any]:
    
    detected_allergens = {}
    detected_hazards = {} 
    found_personal_risk = False
    found_hazard_risk = False
    
    # 1. PREPARE USER PROFILE
    user_profile_keys = []
    for req in user_allergens:
        req = req.lower().strip()
        mapped = False
        for key, data in ALLERGEN_ONTOLOGY.items():
            if req == key or req in [l.lower() for l in data['labels']]:
                user_profile_keys.append(key)
                mapped = True
                break
        if not mapped: user_profile_keys.append(req)

    # 2. SCANNING LOOP
    for item in items:
        # A. CHECK ALLERGENS
        for key, data in ALLERGEN_ONTOLOGY.items():
            for term in data['terms'] + data['aliases']:
                match_found = False
                
                # Exact / Substring Match
                if term in item:
                    match_found = True
                # Safe Fuzzy Match (Only for long words > 4 chars)
                elif len(term) > 4:
                    if difflib.SequenceMatcher(None, term, item).ratio() > 0.85:
                        match_found = True
                
                if match_found:
                    if key not in detected_allergens:
                        detected_allergens[key] = { "found_terms": [], "is_direct_risk": False }
                    detected_allergens[key]["found_terms"].append(item)
                    
                    if key in user_profile_keys:
                        detected_allergens[key]["is_direct_risk"] = True
                        found_personal_risk = True
                    break # Move to next ontology key

                # B. CHECK HAZARDS (The Cancer/Toxin Protocol)
        for h_key, h_data in HAZARD_ONTOLOGY.items():
            for term in h_data['terms']:
                match_found = False
                
                # Exact match
                if term in item:
                    match_found = True
                
                # Looser Fuzzy match for chemicals
                # Changed from len > 5 to len > 3 to catch "BHT", "Red 40"
                # Changed ratio from 0.90 to 0.80 to catch typos
                elif len(term) > 3: 
                     if difflib.SequenceMatcher(None, term, item).ratio() > 0.80:
                        match_found = True
                
                if match_found:
                    if h_key not in detected_hazards:
                        detected_hazards[h_key] = {
                            "label": h_data["label"],
                            "found_term": item,
                            "danger_msg": h_data["danger"]
                        }
                        found_hazard_risk = True
                    break

    # 3. CALCULATE FINAL RISK & EXPLANATION
    risk_level = "LOW"
    summary = "Safe: No ingredients from your profile were detected."

    # Priority 1: Anaphylaxis (Immediate Death Risk)
    if found_personal_risk:
        risk_level = "HIGH"
        summary = "DANGER: Ingredients matching your allergy profile were found."
    
    # Priority 2: Carcinogens/Toxins (Long-term Health Risk)
    elif found_hazard_risk:
        risk_level = "HIGH" # Elevate to HIGH for carcinogens
        summary = "HEALTH ALERT: Hazardous or carcinogenic additives detected."
        
    # Priority 3: Cross-Contamination / Other Allergens
    elif len(detected_allergens) > 0:
        risk_level = "MODERATE"
        names = [ALLERGEN_ONTOLOGY[k]['labels'][0] for k in detected_allergens.keys()]
        summary = f"Note: Contains {', '.join(names)}. (Not in your allergy list)."

    return {
        "risk_level": risk_level,
        "explanation": summary,
        "detected_allergens": detected_allergens,
        "detected_hazards": detected_hazards,
        "user_profile": user_profile_keys
    }