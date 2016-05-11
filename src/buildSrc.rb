require 'json'

Encoding.default_external = 'utf-8'

$gherbs = Array.new
$gherbs_dose = Array.new
formulas = Hash.new

class String
	def del_comment( comment_delimiter="#" )
	    self.gsub(/#{comment_delimiter}.*$/, '')
	end
	
	def del_emptyline( line_delimiter = "\r?\n" )
	    self.gsub(/^\s*$#{line_delimiter}/, '')
	end
end

def parseIng(arr)
	if arr.strip == "-"
		return {}
	end
	ing = arr.split("\t").map(&:strip)
	ll = ((ing.size % 3) == 0)? (ing.size / 3) : (ing.size / 3) + 1
	tmp = Array.new
	(1..ll).each do |i|
		herbName = ing[i*3-3] || ""
		tmp << {name: (herbName), num: (ing[i*3-2]||""), scale: (ing[i*3-1]||"")}
	end
	
	tmp_rev = tmp.reverse
	(0...ll).each do |j|
		if tmp_rev[j][:num] == ""
			tmp_rev[j][:num] = tmp_rev[j-1][:num]
			tmp_rev[j][:scale] = tmp_rev[j-1][:scale]
		elsif tmp_rev[j][:scale] == ""
			tmp_rev[j][:scale] = "兩"
		end
	end
	
	tmp_rev_rev = tmp_rev.reverse
	mying = Hash.new
	tmp_rev_rev.each_with_index do |hb, i|
		mying[hb[:name]] = {:dose => hb[:num], :measure => hb[:scale], :id => i + 1}
		$gherbs.push(hb[:name])
		$gherbs_dose.push("#{hb[:name]}#{hb[:num]}")
	end
	
	mying
end

def addSynonym(hash)
	rst = hash.dup
	hash.each_key do | herb |
		$chageSrc.each do |a, b|
			if ( herb =~ a ) == 0
				rst[ b ] = hash[herb]
				$gherbs.push( b )
				$gherbs_dose.push("#{ b }#{ hash[herb][:dose] }")
			end
		end
	end	
	rst
end

#====

def read_preprocess(filename, option={remove_emptyline: true})
	rst = File.open(filename, 'r').read.del_comment()
	( option[:remove_emptyline] )? rst.del_emptyline() : rst
end

# get herb data

$chageSrc = read_preprocess("data/herbSynonym.tsv").split(/\r?\n/).map do |x|
	_x = x.split("\t")
	[/^(#{_x[0].strip})$/, _x[1].strip]
end

# get formula data

read_preprocess("data/formulaName.tsv").split(/\r?\n/).each_with_index do | line, i |
	datas = line.split(/\t/)
	txNameKr = datas[1].strip		# 한글 명칭
	rst = {
		:id => i,
		:no => datas[0].strip,
		:txName => datas[2].strip,  # 한자 명칭
	}
	formulas[ txNameKr.to_sym ] = rst
end

dataFiles = [['data/fangJi.tsv', [:txFangi]], ['data/fangJiExt.tsv', [:txFangiExt]]]	#tsv

dataFiles.each do |f, colNames|
	read_preprocess(f).split(/\r?\n/).each_with_index do | line, i |
		datas = line.split(/\t/).map(&:strip)
		colNames.each_with_index do | colname, j |
			formulas[ datas[1].to_sym ][ colname ] = datas[ j+2 ] 
		end
	end
end

read_preprocess("data/formulaDose.tsv", {remove_emptyline: false}).split(/\r?\n\r?\n/).each_with_index do | pg, i | 
	_pgs = pg.split(/\r?\n/)
	key = _pgs[1].strip
	formulas[ key.to_sym ][:txGoo] = _pgs[2].strip
	formulas[ key.to_sym ][:ingOrg] = parseIng( _pgs[3].strip )
	formulas[ key.to_sym ][:ing] = addSynonym( formulas[ key.to_sym ][:ingOrg] )
end

####

$gherbs.uniq!
$gherbs_dose.uniq!

herbs = Hash.new
yackzing = Hash.new
symp = Hash.new
File.open("data/symptoms.tsv", 'r').read.gsub("﻿", "").split("\n").each do |sm|
	tmp = sm.split("\t")
	symp[tmp[0]] = {:org => tmp[1] }
end

File.open("data/yackzing.tsv", 'r').read.gsub("﻿", "").split("\n").each do |line|
	herbName = String.new
	tmp = line.split("\t").map(&:strip)
	herbName = tmp[0]
	yackzing[herbName] = {
		:org_name => tmp[1],
		:desc => tmp[2]
	}
	symp.each_key do |ss|
		if tmp[2].include?(symp[ss][:org])
			symp[ss][:herbs] ||= Array.new
			symp[ss][:herbs].push(herbName)
		end
	end
end

re_list = Hash.new
re_list_dose = Hash.new

formulas.each_key do |k|
	formulas[k][:ing].each_key do |kk|	# K: 처방명, KK: 본초명
		re_list[kk] ||= Array.new
		re_list[kk] << k
		tmp_dose = "#{kk}#{formulas[k][:ing][kk][:dose]}"
		unless kk == tmp_dose
			re_list_dose[tmp_dose] ||= Array.new
			re_list_dose[tmp_dose] << k
		end
	end
end

$gherbs.each do |ghb|
	herbs[ghb] = {
		:txYG => ( yackzing[ghb] ? yackzing[ghb][:desc] : "" ),
		:link => re_list[ghb]
	}
end

$gherbs_dose.each do |ghb|
	herbs[ghb] = {
		:link => re_list_dose[ghb]
	}
end

# File.open("tmp_re_list_dose", 'w').puts( re_list_dose.to_json )
# File.open("tmp_re_list", 'w').puts( re_list.to_json )

result = File.open("sanghan_formulas.json", 'w')
rst = Hash.new
rst[:formulas] = formulas
rst[:herbs] = herbs
rst[:symptoms] = symp
rst_json = rst.to_json
rst_json_str = rst_json.to_s.gsub(/(\d)\.(\d)/, '\1,\2')
result.puts(rst_json_str)

result2 = File.open("sanghan_herbs.json", 'w')
result2.puts($gherbs.uniq.inspect)



