<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>TM Icon Font Preview</title>
    <meta name="description" content="An Icon Font Generated By Trend Micro">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="demo-files/icon-font-demo.css">
    <link rel="stylesheet" href="icon-font.css"></head>
<body>
    <div class="wrapper">
        <div class="bgc1 clearfix">
            <h1 class="mvm">TM Icon Font Preview</h1>
            <p>
                Font: _fontName <span class="fgc1">(Glyphs:&nbsp;_glyphsCount)</span><br/>
                Date generated: _generatedDate
            </p>
        </div>
        <div class="clearfix ptl">
            <h1 class="grid-size mvm mtn fgc1">Grid size: _gridSize px</h1>
            <!--Icons repeater-->
        </div>

        <!--[if gt IE 8]><!-->
        <div class="test-drive clearfix mbl">
            <h1>Font Test Drive</h1>
            <label>
                Font Size: <input id="fontSize" type="number" class="textbox0 mbm"
                min="8" value="48" />
                px
            </label>
            <input id="testText" type="text" class="phl size1of1 mvl"
            placeholder="Type some text to test..." value=""/>
            <div id="testDrive" class="">&nbsp;
            </div>
        </div>
        <!--<![endif]-->
        <div class="footer bgc1 clearfix">
            <p>Generated by <a href="https://github.com/trendmicro-frontend" target="_blank">Trend Micro Frontend</a></p>
        </div>
    </div>
    <script src="demo-files/icon-font-demo.js"></script>
    <!--Script placeholder-->
</body>
</html>
