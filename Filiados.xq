let $ps := distinct-values(//filiado/@partido)
for $p in $ps
let $qtd := sum(//filiado[@partido = $p])
order by $qtd descending
return <partido sigla="{$p}" filiados="{format-number($qtd, "###,###")}"/>
