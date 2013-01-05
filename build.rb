require 'erb'
require 'zlib'
require 'rubygems'
require 'config'
require 'fileutils'
require 'open3'
if USE_ONLINE_CLOSURE == true
	require 'net/http'
	require 'json'
else
	require 'closure-compiler'
end 

$scripts = ["swipe.js","ao.js"]
$pages = ["home","career","music"]

def load_scripts_development()
	output = ""
	for script in $scripts
		crc = Zlib::crc32(File.read("javascripts/"+script)).to_s(36)
		filename = "js/"+crc+"."+script
		FileUtils.cp("javascripts/"+script,filename)
		output += "<script src=\""+filename+"\"></script>"
	end
	output
end

def load_scripts_production()
	output = ""
	for script in $scripts
		output += File.read("javascripts/"+script)
	end
	filename = "js/" + Zlib::crc32(output).to_s(36) + ".js"
	
	# if the file already exists, skip compiling
	if File.exists?(filename) === false

		if USE_ONLINE_CLOSURE == true
			puts "Using online closure compiler."
			uri = URI.parse("http://closure-compiler.appspot.com/compile")
			response = Net::HTTP.post_form(uri,
				"output_format" => "json",
				"output_info" => "compiled_code",
				"compilation_level" => "ADVANCED_OPTIMIZATIONS",
				"warning_level" => "verbose",
				"output_file_name" => "default.js",
				"js_code" => output
			)
			if response.code != "200"
				raise "POST returned #{response.code}"
			end
			json =  JSON.parse(response.body)
			output = json['compiledCode']
		else
			puts "Using offline closure compiler."
			closure = Closure::Compiler.new(:compilation_level => 'ADVANCED_OPTIMIZATIONS')
			output = closure.compile(output)
		end
		
		File.open(filename, "w+") do |f|
			f.write(output)
		end
	else
		puts "Skipping closure compilation."
	end
	"<script src=\""+filename+"\"></script>\n"
end

def load_scripts()
	if PRODUCTION	== true
		load_scripts_production()
	else
		load_scripts_development()
	end
end

script_includes = load_scripts()
template = File.read("index.html.erb")

$currentPage = nil

def selected(pageName)
	
	if pageName === $currentPage
		'class="selected"'
	end
end


for page in $pages
	$currentPage = page
	
	
	renderer = ERB.new(template)
	html = renderer.result()
	
	if PRODUCTION === true
		Open3.popen3("java -jar htmlcompressor-1.5.3.jar") {|stdin, stdout, stderr|
			stdin.write(html)
			stdin.close
			
			html = stdout.read()
		}
	end
	
	if page == "home"
		page = "index"
	end

	File.open(page+".html", "w+") do |f| 
		f.write(html)
	end
end




