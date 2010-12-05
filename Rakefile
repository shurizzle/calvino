require 'rake'
require 'rake/clean'

CLEAN.include(['calvino.min.js'])

module CalvinoHelper
  def self.shell_escape(str)
    "\"#{str.gsub(/\$|`|"|\\/, '\\\\\1')}\""
  end

  def self.which exe
    ENV['PATH'].split(':').select {|path|
      File.executable_real?(File.join(path, exe))
    }.map {|x| File.realpath(File.join(x, exe)) }.uniq
  end

  def self.closure_compiler(optimization = nil)
    if [:whitespace, :simple, :advanced].include?(optimization)
      optimization = {
        :whitespace => 'WHITESPACE_ONLY',
        :simple     => 'SIMPLE_OPTIMIZATIONS',
        :advanced   => 'ADVANCED_OPTIMIZATIONS'
      }[optimization]
    else
      optimization = nil
    end

    ls = self.which 'closure-compiler'
    return "#{self.shell_escape ls.first}#{" --compilation_level #{optimization}" if optimization}" if !ls.empty?
    STDERR.puts "Please install closure-compiler first."
    exit 1
  end

  def self.minify(file, options)
    if !File.exists?(file)
      return false
    end

    options[:out] = file.clone.sub(/\.js$/, '.min.js') if !options[:out]

    if !File.exists?(options[:out]) || File.mtime(file) > File.mtime(options[:out])
      sh "#{self.closure_compiler options[:optimization]} --js #{self.shell_escape(file)} --js_output_file #{self.shell_escape(options[:out])}"

      if options[:header]
        contents = File.read options[:out]
        File.open(options[:out], 'w') {|fp|
          fp.puts options[:header]
          fp.write contents
        }
      end

      if $? != 0
        File.unlink(options[:out]) rescue nil
        return false
      end
    end

    return true
  end

  def self.flag?(name)
    name = name.to_s
    ENV[name] and ENV[name] =~ /^y(es|eah)?$/
  end

  def self.browser
    if ENV['BROWSER']
      bl = self.which(ENV['BROWSER'])
      return bl.first if !bl.empty?
    end

    %w{firefox chromium chrome uzbl opera surf epiphany}.each {|browser|
      if (browser = self.which browser)
        return browser
      end
    }
  end
end

OPTIMIZATION = if ENV['OPTIMIZATION'] =~ /^(whitespace|simple|advanced)$/i
  ENV['OPTIMIZATION'].downcase.to_sym
else
  nil
end

task :default => :minify

task :minify do
  CalvinoHelper.minify('src/calvino.js', :out => 'calvino.min.js', :optimization => OPTIMIZATION,
      :header => '/* Calvino is released under AGPLv3. Copyleft shura. [shura1991@gmail.com] */')
end

task :test => :minify do
  sh "#{CalvinoHelper.shell_escape CalvinoHelper.browser} test/test.html"
end
