$(function()
{
	/*------------------------------------------------------------------------
	 * Traverser does a depth-first traversal of every node in the DOM tree
	 * and turns it into a linear list, to which it maintains an internal
	 * pointer. Call traverser.next() to return the next node in sequence.
	 * We only spider document.body because we're not interested in
	 * the <head>.
	 *-----------------------------------------------------------------------*/
    var traverser = new Traverser();
    
    var traverserScope = document.body.getElementsByClassName('content')[0];
    traverser.traverse(traverserScope);

	/*------------------------------------------------------------------------
	 * SamplePlayer loads a series of samples from base64-encoded data
	 * and plays them using WebAudio AudioBufferSource nodes.
	 * See samples.js for sample data.
	 *-----------------------------------------------------------------------*/
    var player = new SamplePlayer();
    player.init();

	for (var sample in samples)
	{
		console.log("loading " + sample);
		player.loadData(samples[sample], sample);
	}

	/*------------------------------------------------------------------------
	 * WordPlayer generates melodic output based on the vowel content of a
	 * given word, with convolution-based reverb.
	 *-----------------------------------------------------------------------*/
    var wordPlayer = new WordPlayer();
    // wordPlayer.sinosc.loadIRData("spatialized3");

	/*------------------------------------------------------------------------
	 * Spanifier wraps every word in the document body inside a
	 * <span class="word">, which are also maintained in an internal list.
	 * Should probably rewrite this as a jQuery method and use .each
	 * (similar to lettering.js). 
	 *-----------------------------------------------------------------------*/
    var spanifier = new Spanifier();
    spanifier.spanify(traverserScope);

	var sonify_words = true;
	var sonify_tags = true;

	var div = $( "<div id='_mm_controls'>" );
	$("body").append(div);
	div.html("<b>Markup Melodium</b><br /><br /><input type='checkbox' checked='checked' id='_mm_words' /> Words<br /><input type='checkbox' checked='checked' id='_mm_tags' /> Tags" +
		"<style>#_mm_controls { position: fixed; top: 0px; right: 0px; padding: 20px 40px; background: #ffd; font-size: 12px; font-family: helvetica, arial;</style>");
	$("#_mm_words").change(function() { sonify_words = this.checked; });
	$("#_mm_tags").change(function() { sonify_tags = this.checked; });

	/* 
		For live experience or variation 
		applyState() read new words and node in the DOM

	*/

	$('body').append('<div id="apply" style="cursor: pointer;font-family: helvetica;position:fixed; top:120px;right:0px;background:yellow;padding: 9px 66px;">SAVE</div>')
	$('#apply').on('click', function( event ) {
		applyState();
	});

	function applyState() {	
		//	de-spanifier
		$('span').each(function() {
		    $(this).replaceWith($(this).text());
		});
		//	clean traverser.nodeList and re-init
		traverser.nodeList.length = 0;
		traverser.traverse(traverserScope);
		//	clean spanifier.spans and re-init
		spanifier.spans.length = 0;
		spanifier.spanify(traverserScope);
		//	clear loop
		window.clearInterval(setLoop);
		setLoop = startLoop();
	};

	/*------------------------------------------------------------------------
	 * Trigger sonification of elements and words on a 100ms clock.
	 *-----------------------------------------------------------------------*/
	var rest = 0;

	var setLoop = startLoop();

	function startLoop() {
		return window.setInterval(function()
		{
			var node = traverser.next();
			var tagName = node.tagName.toLowerCase();
			if (sonify_tags)
			{
				player.playSound(tagName);
				traverser.highlight(node);
			}

			if (rest-- <= 0)
			{
				var span = spanifier.next();
				if (sonify_words)
				{
					wordPlayer.playWord(span);
					rest = wordPlayer.rest();
					spanifier.highlight(span);
				}
			}
		}, 100);
	}
});
