*In progress*
## Device optimization

The site design and project assets are optimized for the iPad Pro 12." However, it should be responsive and viewable on a laptop or desktop. 

Ideal: responsive across mobile to tablet to desktop.
## Project page display

Project page and project content `<div>` structure
- Two nested containers, center aligned horizontally and vertically
- the outer container has a static image as background
- the inner nested `<div>` contains embedded processing code running on a cropped version of the background image. The image dynamically changes in response to code parameters.

Behavior
1. user loads the page
2. processing code is triggered after a (500ms) delay (this allows the page to load and the user to absorb what they're looking at).
3. user clicks "reset" button to restart the decay
4. when ready, user clicks a different project to view from the gallery navigation bar below the project block

## Spacing and layout
Use a 4px grid system.

Center-align main containers.

## Dimensions

```
/* Carousel */ 
--carousel-thumb-width: 116px; 
--carousel-thumb-height: 116px; 
--carousel-thumb-radius: 28px;

```
## typography
```
h1, site-title: {
	font-family: 'Ubuntu Mono';
	font-style: normal;
	font-weight: 400;
	font-size: 32px;
	line-height: 32px;
	}
h2: {
	font-family: 'Ubuntu Mono';
	font-style: normal;
	font-weight: 400;
	font-size: 24px;
	line-height: 24px;
}
body: {
	font-family: 'PT Sans';
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	line-height: 20px;
	/* or 125% */
	letter-spacing: 0.1px;
}
label: {
	font-family: 'Ubuntu Sans Mono';
	font-style: normal;
	font-weight: 600;
	font-size: 14px;
	line-height: 20px;
}

```


## Color

```
--near-black: #0D1820;
--dark-teal: #508991;
--light-teal: #75DDDD;
--near-white: #EBF2FA;
--gray-10: #CED7E1;
--acid-green: #A5BE00;

--color-text-header: var(--near-black);
--color-text-header-inverse: var(--near-white);
--color-text-body-inverse: var(--gray-10);
--color-text-body: var(--primary-black);
--color-text-default-text-inverse: var(--near-white);
--color-text-link-default: var(--dark-teal);
--color-text-link-default-inverse: var(--light-teal);
--color-text-link-hover: var(--acid-green);
--color-background-dark: var(--near-black);
--color-background-light: var(--near-white);
--color-box-shadow-teal: var(--light-teal);
--color-box-shadow-acid-green: var(--acid-green);
--color-box-shadow-black: var(--near-black);
--color-border-black: var(--near-black);
```

## State Effects

```
/* State Effects */ 
--effect-thumb-active-filter: saturate(25%); 
--effect-thumb-transition: filter 0.25s ease-in-out;
```

## Components

```
.button-primary {
	align-items: center;
	padding: 6px 16px;
	width: 72px;
	height: 32px;
	background: var(--near-black);
	
	/* light teal drop shadow */
	filter: var(--color-box-shadow-teal);
	
	border-radius: 2px;
	
	/* label */
	text-color: var(--near-white);
}
.button-inverse {
	align-items: center;
	padding: 6px 16px;
	width: 72px;
	height: 32px;
	background: var(--acid-green);
	text-color: var(--near-black);
	
	/* black drop shadow */
	filter: var(--color-box-shadow-black)
	
	border-radius: 2px;
	
	/* label */
	text-color: var(--near-black);
}

/* project carousel */

.carousel-item { 
	display: block; 
	flex-shrink: 0; 
	width: var(--carousel-thumb-width); 
	height: var(--carousel-thumb-height); 
	border-radius: var(--carousel-thumb-radius); 
	overflow: hidden; 
}

.carousel-thumb {
	padding: 0px;
	width: 116px;
	height: 116px;
	
	/* acid green drop shadow */
	box-shadow: 3px 3px 0px var(--acid-green);
	border-radius: 28px;
}

/* Active State: Targets the image inside the active item wrapper */ 

.carousel-item.is-active .carousel-thumb { 
	filter: var(--effect-thumb-active-filter) var(--color-box-shadow-acid-green);
}

```

## S05 Wave
**Regime preset:** Chaos
{
"inputArtifact": "S05 wave 2048x2048.jpg",
"parameters": {
"feed": 0.026,
"kill": 0.051,
"dA": 1,
"dB": 0.6,
"seedingMode": "edge",
"seedStrength": 0.5,
"seedCoverage": 0.4,
"threshold": 8,
"seedModulatesDiffusion": false,
"displacementMode": "b-as-index",
"displacementStrength": 18,
"fixedAngleDeg": 94,
"colorPalette": "none",
"blendMode": "color-tint",
"hueShift": 0,
"saturation": 100,
"brightness": 100,
"contrast": 100,
"sCurve": "none",
"invert": false,
"accumulate": true,
"bgFill": "seed-mean",
"simScale": 2,
"stepsPerFrame": 6
},
}

## Moonshot
**File:** S02b_moonshot_2048x2048.jpg
**Process:** Glitch & Reassembly
**Operation:** Block displace - structural (jpeg corrupt)
**Application Mode:** Continuous
**Parameters**
- Amount: 0.16
- Block size: 89 px
- Max shift: 60 px
- Direction: Horizontal only
- Encode quality (structural): 0.48

**Buffer:** 
- Accumulate? No
- Speed: 10 fps

## Acid Leaf

**File:** S01_acid_leaf_2048x2048.jpg
**Process:** Glitch & Reassembly
**Operation:** Signal noise - structural (bit flip)
**Application Mode:** Continuous
**Parameters**
- Amount: 0.35
- Block size: 18 px
- Pattern: Scanlines (whole rows)
- Bit-flip count (structural): 2900

**Buffer:** 
- Accumulate? Yes
- Speed: 300 fps
## S03 Pulsatilla
**Regime preset:** Spots (Coral)
{
"inputArtifact": "S03_pulsatilla_2048x2048.jpg",
"parameters": {
"feed": 0.037,
"kill": 0.065,
"dA": 1,
"dB": 0.5,
"seedingMode": "brightness",
"seedStrength": 0.65,
"seedCoverage": 0.4,
"threshold": 9,
"seedModulatesDiffusion": true,
"displacementMode": "b-gradient-inverse",
"displacementStrength": 21,
"fixedAngleDeg": 39,
"colorPalette": "none",
"blendMode": "color-tint",
"hueShift": 0,
"saturation": 100,
"brightness": 100,
"contrast": 100,
"sCurve": "strong-s",
"invert": false,
"accumulate": true,
"bgFill": "black",
"simScale": 2,
"stepsPerFrame": 12
},
}

