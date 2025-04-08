from google import genai
import re
import os
from dotenv import load_dotenv

class GeminiEngine:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

        # Initialize Gemini client
        self.client = genai.Client(api_key=api_key)
    
    def generate_content(self, prompt, model="gemini-2.5-pro-exp-03-25"):
        """Generate content using Gemini AI"""
        response = self.client.models.generate_content(
            model=model,
            contents=prompt
        )
        return response.text
    
    def generate_cad(self, prompt, model="gemini-2.5-pro-exp-03-25"):
        """Generate OpenSCAD code using Gemini AI"""
        # Prompt engineering for OpenSCAD code generation
        cad_prompt = f"""
        Generate clean, valid OpenSCAD code for: {prompt}
        
        Use ONLY standard OpenSCAD syntax and primitives like:
        - cube([width, depth, height])
        - sphere(r=radius)
        - cylinder(h=height, r=radius)
        - translate([x, y, z]) {{ ... }}
        - rotate([x, y, z]) {{ ... }}
        - union() {{ ... }}
        - difference() {{ ... }}
        - intersection() {{ ... }}
        
        Provide ONLY the valid OpenSCAD code with no explanations, comments, or markdown.
        The code should be complete and syntactically correct.
        """
        
        response = self.client.models.generate_content(
            model=model,
            contents=cad_prompt
        )
        
        code = response.text
        
        # This removes the markdown code blocks if they are present
        code = re.sub(r'```(?:openscad|)?\n(.*?)\n```', r'\1', code, flags=re.DOTALL)
        
        return code.strip()