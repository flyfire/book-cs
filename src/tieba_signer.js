 /*
使用说明 ：
	step1. 用你的账号登录百度贴吧
	step2. 用chrome浏览器打开任意一【百度贴吧】页面 ：http://tieba.baidu.com/
	step3. 在页面任意处右键，选择“审查元素”--Console（控制台），输入以下代码，回车即可，出错可手动多次重试
	任何其他事情请移步【英雄志】贴吧，管理员当热心为您解答： http://tieba.baidu.com/f?kw=%D3%A2%D0%DB%D6%BE
*/

(function(){
	var tiebaUrl = "http://tieba.baidu.com/";
	var tiebaUtil = {
		_iframeId:0,
		GenIframeId:function(){
			++this._iframeId;
			return "__utilIframe" + (new Date().getTime()) + "_" + this._iframeId;
		},
		LoadContentByUrl:function(url,cb,showOptions){
			console.log("Load url:" + url);
			var curId = this.GenIframeId();
			var curIframe = $("<iframe id='" + curId + "'></iframe>");
			if (!showOptions) curIframe.hide();
			$("body").append(curIframe);			
			curIframe.load(cb);
			var p = url.indexOf("?");
			if (p == -1)
				url += "?";
			p = url.indexOf("=");
			if (p >= 0)
				url += "&";
			url += "__rand_dummy=" + new Date().getTime();
			curIframe.attr("src",url);
		}
	};	

	function DebugMsg(msg)
	{
		console.log(msg);
	}
	//load jQuery
	if (!window.$ || !window.$.fn || !window.$.fn.jquery)
	{
		DebugMsg("loaded  not already");
		var head = document.getElementsByTagName("head")[0] || document.documentElement,
			script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js ";
		head.insertBefore(script, head.firstChild);	
		//load finish callback
		if (script.readyState)
		{
			script.onreadystatechange = function(){
				if (script.readyState == "loaded" || script.readyState == "complete")
					StartApp();
			};
		}
		else
			script.onload = StartApp;	
	}
	else{
		DebugMsg("loaded already");
		StartApp();
	}
	function StartApp()
	{
		var allList = $('#always_go_list a.j_ba_link');
		if (allList.length == 0){
			alert("Jump to:" + tiebaUrl + ",please retry again");
			location = tiebaUrl;
		}
		var privateId = "_nofree_use_it_private";
		var msgContainer = $("<div class='" + privateId + "' style='border:1px solid red;margin:20px 10px;padding:10px;background-color:white;z-index:20122012'></div>");	
		function AppendHtml(html)
		{
			var elem = $("<div></div>").html(html);
			msgContainer.append(elem).append("<br />");		
		}
		function Msg(msg,color,cls)
		{
			var elem = $("<div></div>").text(msg);
			if (color) elem.css("color",color);
			if (cls) elem.addClass(cls);
			msgContainer.append(elem);
			return elem;
		}
		function GreenMsg(msg,cls)
		{
			return Msg(msg,"green",cls);
		}
		function RedMsg(msg,cls)
		{
			return Msg(msg,"red",cls);
		}
		var globalFlag = {};
		function SignTieba(cb,curTry,i)
		{
			var curTieba = $(this);
			var name = curTieba.text();
			if (globalFlag[name] !== 1)
			{
				var li = curTieba.closest("li");
				if (li.find(".forum_sign").length){
					AppendHtml(li.html());
					globalFlag[name] = 1;
				}
			}
			if (globalFlag[name] === 1)
			{
				cb(true);
				return;
			}
			msgContainer.find(".try" + i).remove();
			RedMsg("try sign [count：" + curTry + "]:" + name,"try" + i);
			var href = curTieba.attr("href");
			tiebaUtil.LoadContentByUrl(href,function(){
				var body = $(this).contents().find("body");
				var a = body.find("#sign_mod a.j_cansign");
				var isSigned = (a.length == 0);
				var container = body.find("div.sign_succ_content_container");
				if (!isSigned)
				{
					var x = this.contentWindow;
					if (x)
					{				
						a = x.$("#sign_mod a.j_cansign");
					}
					a.click();
				}
				$(this).remove();
				if (cb) cb(isSigned);
			});
		}
		function SignAll()
		{	
			msgContainer.html("");
			GreenMsg("自动签到大业开始，如有失败，请复制代码重试...");
			var allList = $('#always_go_list a.j_ba_link');
			if (allList.length == 0)
			{
				RedMsg("no tieba need to sign");				
				return;
			}
			GreenMsg("total :" + allList.length);
			var i = 0;
			var iMax = allList.length;
			var tryCount = 3; // 每个贴吧签到重试次数
			var curTry = 0;
			var successCount = 0;
			var failedCount = 0;
			function DoSign(isSigned)
			{
				if (i >= iMax) return;
				++curTry;
				if (!isSigned && curTry <= tryCount)
				{ 
					//sign cur: i
					SignTieba.call(allList[i],DoSign,curTry,i);
				}
				else{
					var name = $(allList[i]).text();
					if (!isSigned){
						++failedCount;
						msgContainer.find(".try" + i).remove();
						RedMsg("sign [ try count：" + curTry + "]:【" + name + "】 --- finally failed");						
					}
					else{
						++successCount;
						msgContainer.find(".try" + i).remove();
						GreenMsg("sign [ try count：" + curTry + "]:【" + name + "】 --- success");
					}
					//try next
					++i;
					curTry = 0;
					DoSign(false,i);
				}				
			}
			DoSign(false);
			//msgContainer.find(".try").remove();
			GreenMsg("all done. [ toatal:" + allList.length + ", success:" + successCount + ", failed:" + failedCount + "]","").css("font-weight","bolder").css("font-size","3em")
				.css("padding","10px");
		}	
		DebugMsg("StartApp");
		$("div." + privateId).remove();
		$("body").prepend("<br/>").prepend(msgContainer);
		SignAll();
		//AppendMsg("Starting...");
		//GotMyId();	

	}	
})();
	
