import os
import random
import base64
from PIL import Image

def build_digit_data_28x28():
    base_dir = "images/mnist_png/testing"
    
    digits_js = "const VEHICLES = [\n"
    colors = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#14b8a6', '#a855f7']
    labels = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

    for d in range(10):
        digit_dir = os.path.join(base_dir, str(d))
        files = [f for f in os.listdir(digit_dir) if f.endswith('.png')]
        random.seed(42 + d)
        selected = random.sample(files, min(10, len(files))) # 10 samples per digit is plenty for B64
        
        sample_data = []
        for file in selected:
            fp = os.path.join(digit_dir, file)
            with open(fp, "rb") as imm:
                b64 = base64.b64encode(imm.read()).decode('utf-8')
            
            img = Image.open(fp).convert('L') # Already 28x28
            
            px_val = []
            for y in range(28):
                for x in range(28):
                    px_val.append(round(img.getpixel((x,y)) / 255.0, 2))
                    
            sample_data.append(f"{{ b64: 'data:image/png;base64,{b64}', pixels: {px_val} }}")

        outWeights = [0.01] * 10
        outWeights[d] = 2.95
        
        digits_js += f"""  {{
    id:'{d}', label:'{labels[d]}', emoji:'{emojis[d]}', color:'{colors[d]}',
    outWeights: {outWeights},
    samples: [{', '.join(sample_data)}],
    get imgUrl() {{ return this.samples[this.currentSample].b64; }},
    get pixels() {{ return this.samples[this.currentSample].pixels; }},
    currentSample: 0,
    drawSVG(S,x,y,w,h,dk,cm){{ makeImgDrawSVG(this.imgUrl,this.color)(S,x,y,w,h,dk,cm); }}
  }},\n"""
    
    digits_js += "];"
    
    with open('mnist.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    import re
    # 1. Update the VEHICLES array with 28x28 data
    html = re.sub(r'const VEHICLES = \[\s*\{[\s\S]*?\];', digits_js, html)
    
    # 2. Update Grid display constants
    html = html.replace('const CELL=20, COLS=5, ROWS=5;', 'const CELL=4.2, COLS=28, ROWS=28;')
    
    # 3. Update default Architecture on toggle
    html = html.replace("document.getElementById('iv').value = 25; document.getElementById('sl-input').value = 25;", 
                        "document.getElementById('iv').value = 784; document.getElementById('sl-input').value = 784;")
    html = html.replace("document.getElementById('lv').value = 3; document.getElementById('sl-layers').value = 3;", 
                        "document.getElementById('lv').value = 1; document.getElementById('sl-layers').value = 1;")
    html = html.replace("document.getElementById('nv').value = 16; document.getElementById('sl-nodes').value = 16;", 
                        "document.getElementById('nv').value = 40; document.getElementById('sl-nodes').value = 40;")

    # 4. Force ReLU as activation for MNIST
    html = html.replace("const v=document.getElementById('sel-act')?.value||'sigmoid';", 
                        "const v='relu';")

    # 5. Fix modulo operators for 784 flattened pixels
    html = html.replace("ni % 25", "ni % 784")
    html = html.replace("ni%25", "ni%784")
    
    # 6. Update labels
    html = html.replace("5\\xd75 (MNIST)", "28\\xd728 (Full MNIST)")
    
    with open('mnist.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("MNIST 28x28 Update Done")

if __name__ == '__main__':
    build_digit_data_28x28()
