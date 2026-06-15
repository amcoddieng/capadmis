import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model etudiant
 *
 */
export type etudiantModel = runtime.Types.Result.DefaultSelection<Prisma.$etudiantPayload>;
export type AggregateEtudiant = {
    _count: EtudiantCountAggregateOutputType | null;
    _avg: EtudiantAvgAggregateOutputType | null;
    _sum: EtudiantSumAggregateOutputType | null;
    _min: EtudiantMinAggregateOutputType | null;
    _max: EtudiantMaxAggregateOutputType | null;
};
export type EtudiantAvgAggregateOutputType = {
    id: number | null;
};
export type EtudiantSumAggregateOutputType = {
    id: number | null;
};
export type EtudiantMinAggregateOutputType = {
    id: number | null;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    mdp: string | null;
    sexe: string | null;
    ville: string | null;
    payes: string | null;
    date_de_naissance: Date | null;
    lieu_de_naissance: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type EtudiantMaxAggregateOutputType = {
    id: number | null;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    mdp: string | null;
    sexe: string | null;
    ville: string | null;
    payes: string | null;
    date_de_naissance: Date | null;
    lieu_de_naissance: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type EtudiantCountAggregateOutputType = {
    id: number;
    nom: number;
    prenom: number;
    email: number;
    mdp: number;
    sexe: number;
    ville: number;
    payes: number;
    date_de_naissance: number;
    lieu_de_naissance: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type EtudiantAvgAggregateInputType = {
    id?: true;
};
export type EtudiantSumAggregateInputType = {
    id?: true;
};
export type EtudiantMinAggregateInputType = {
    id?: true;
    nom?: true;
    prenom?: true;
    email?: true;
    mdp?: true;
    sexe?: true;
    ville?: true;
    payes?: true;
    date_de_naissance?: true;
    lieu_de_naissance?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type EtudiantMaxAggregateInputType = {
    id?: true;
    nom?: true;
    prenom?: true;
    email?: true;
    mdp?: true;
    sexe?: true;
    ville?: true;
    payes?: true;
    date_de_naissance?: true;
    lieu_de_naissance?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type EtudiantCountAggregateInputType = {
    id?: true;
    nom?: true;
    prenom?: true;
    email?: true;
    mdp?: true;
    sexe?: true;
    ville?: true;
    payes?: true;
    date_de_naissance?: true;
    lieu_de_naissance?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type EtudiantAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which etudiant to aggregate.
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of etudiants to fetch.
     */
    orderBy?: Prisma.etudiantOrderByWithRelationInput | Prisma.etudiantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.etudiantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` etudiants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` etudiants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned etudiants
    **/
    _count?: true | EtudiantCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: EtudiantAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: EtudiantSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: EtudiantMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: EtudiantMaxAggregateInputType;
};
export type GetEtudiantAggregateType<T extends EtudiantAggregateArgs> = {
    [P in keyof T & keyof AggregateEtudiant]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEtudiant[P]> : Prisma.GetScalarType<T[P], AggregateEtudiant[P]>;
};
export type etudiantGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.etudiantWhereInput;
    orderBy?: Prisma.etudiantOrderByWithAggregationInput | Prisma.etudiantOrderByWithAggregationInput[];
    by: Prisma.EtudiantScalarFieldEnum[] | Prisma.EtudiantScalarFieldEnum;
    having?: Prisma.etudiantScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EtudiantCountAggregateInputType | true;
    _avg?: EtudiantAvgAggregateInputType;
    _sum?: EtudiantSumAggregateInputType;
    _min?: EtudiantMinAggregateInputType;
    _max?: EtudiantMaxAggregateInputType;
};
export type EtudiantGroupByOutputType = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    mdp: string;
    sexe: string;
    ville: string;
    payes: string;
    date_de_naissance: Date;
    lieu_de_naissance: string;
    createdAt: Date;
    updatedAt: Date;
    _count: EtudiantCountAggregateOutputType | null;
    _avg: EtudiantAvgAggregateOutputType | null;
    _sum: EtudiantSumAggregateOutputType | null;
    _min: EtudiantMinAggregateOutputType | null;
    _max: EtudiantMaxAggregateOutputType | null;
};
export type GetEtudiantGroupByPayload<T extends etudiantGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EtudiantGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EtudiantGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EtudiantGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EtudiantGroupByOutputType[P]>;
}>>;
export type etudiantWhereInput = {
    AND?: Prisma.etudiantWhereInput | Prisma.etudiantWhereInput[];
    OR?: Prisma.etudiantWhereInput[];
    NOT?: Prisma.etudiantWhereInput | Prisma.etudiantWhereInput[];
    id?: Prisma.IntFilter<"etudiant"> | number;
    nom?: Prisma.StringFilter<"etudiant"> | string;
    prenom?: Prisma.StringFilter<"etudiant"> | string;
    email?: Prisma.StringFilter<"etudiant"> | string;
    mdp?: Prisma.StringFilter<"etudiant"> | string;
    sexe?: Prisma.StringFilter<"etudiant"> | string;
    ville?: Prisma.StringFilter<"etudiant"> | string;
    payes?: Prisma.StringFilter<"etudiant"> | string;
    date_de_naissance?: Prisma.DateTimeFilter<"etudiant"> | Date | string;
    lieu_de_naissance?: Prisma.StringFilter<"etudiant"> | string;
    createdAt?: Prisma.DateTimeFilter<"etudiant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"etudiant"> | Date | string;
};
export type etudiantOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nom?: Prisma.SortOrder;
    prenom?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mdp?: Prisma.SortOrder;
    sexe?: Prisma.SortOrder;
    ville?: Prisma.SortOrder;
    payes?: Prisma.SortOrder;
    date_de_naissance?: Prisma.SortOrder;
    lieu_de_naissance?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type etudiantWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    email?: string;
    AND?: Prisma.etudiantWhereInput | Prisma.etudiantWhereInput[];
    OR?: Prisma.etudiantWhereInput[];
    NOT?: Prisma.etudiantWhereInput | Prisma.etudiantWhereInput[];
    nom?: Prisma.StringFilter<"etudiant"> | string;
    prenom?: Prisma.StringFilter<"etudiant"> | string;
    mdp?: Prisma.StringFilter<"etudiant"> | string;
    sexe?: Prisma.StringFilter<"etudiant"> | string;
    ville?: Prisma.StringFilter<"etudiant"> | string;
    payes?: Prisma.StringFilter<"etudiant"> | string;
    date_de_naissance?: Prisma.DateTimeFilter<"etudiant"> | Date | string;
    lieu_de_naissance?: Prisma.StringFilter<"etudiant"> | string;
    createdAt?: Prisma.DateTimeFilter<"etudiant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"etudiant"> | Date | string;
}, "id" | "email">;
export type etudiantOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nom?: Prisma.SortOrder;
    prenom?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mdp?: Prisma.SortOrder;
    sexe?: Prisma.SortOrder;
    ville?: Prisma.SortOrder;
    payes?: Prisma.SortOrder;
    date_de_naissance?: Prisma.SortOrder;
    lieu_de_naissance?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.etudiantCountOrderByAggregateInput;
    _avg?: Prisma.etudiantAvgOrderByAggregateInput;
    _max?: Prisma.etudiantMaxOrderByAggregateInput;
    _min?: Prisma.etudiantMinOrderByAggregateInput;
    _sum?: Prisma.etudiantSumOrderByAggregateInput;
};
export type etudiantScalarWhereWithAggregatesInput = {
    AND?: Prisma.etudiantScalarWhereWithAggregatesInput | Prisma.etudiantScalarWhereWithAggregatesInput[];
    OR?: Prisma.etudiantScalarWhereWithAggregatesInput[];
    NOT?: Prisma.etudiantScalarWhereWithAggregatesInput | Prisma.etudiantScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"etudiant"> | number;
    nom?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    prenom?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    email?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    mdp?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    sexe?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    ville?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    payes?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    date_de_naissance?: Prisma.DateTimeWithAggregatesFilter<"etudiant"> | Date | string;
    lieu_de_naissance?: Prisma.StringWithAggregatesFilter<"etudiant"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"etudiant"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"etudiant"> | Date | string;
};
export type etudiantCreateInput = {
    nom: string;
    prenom: string;
    email: string;
    mdp: string;
    sexe: string;
    ville: string;
    payes: string;
    date_de_naissance: Date | string;
    lieu_de_naissance: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type etudiantUncheckedCreateInput = {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    mdp: string;
    sexe: string;
    ville: string;
    payes: string;
    date_de_naissance: Date | string;
    lieu_de_naissance: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type etudiantUpdateInput = {
    nom?: Prisma.StringFieldUpdateOperationsInput | string;
    prenom?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mdp?: Prisma.StringFieldUpdateOperationsInput | string;
    sexe?: Prisma.StringFieldUpdateOperationsInput | string;
    ville?: Prisma.StringFieldUpdateOperationsInput | string;
    payes?: Prisma.StringFieldUpdateOperationsInput | string;
    date_de_naissance?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lieu_de_naissance?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type etudiantUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nom?: Prisma.StringFieldUpdateOperationsInput | string;
    prenom?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mdp?: Prisma.StringFieldUpdateOperationsInput | string;
    sexe?: Prisma.StringFieldUpdateOperationsInput | string;
    ville?: Prisma.StringFieldUpdateOperationsInput | string;
    payes?: Prisma.StringFieldUpdateOperationsInput | string;
    date_de_naissance?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lieu_de_naissance?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type etudiantCreateManyInput = {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    mdp: string;
    sexe: string;
    ville: string;
    payes: string;
    date_de_naissance: Date | string;
    lieu_de_naissance: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type etudiantUpdateManyMutationInput = {
    nom?: Prisma.StringFieldUpdateOperationsInput | string;
    prenom?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mdp?: Prisma.StringFieldUpdateOperationsInput | string;
    sexe?: Prisma.StringFieldUpdateOperationsInput | string;
    ville?: Prisma.StringFieldUpdateOperationsInput | string;
    payes?: Prisma.StringFieldUpdateOperationsInput | string;
    date_de_naissance?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lieu_de_naissance?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type etudiantUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nom?: Prisma.StringFieldUpdateOperationsInput | string;
    prenom?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mdp?: Prisma.StringFieldUpdateOperationsInput | string;
    sexe?: Prisma.StringFieldUpdateOperationsInput | string;
    ville?: Prisma.StringFieldUpdateOperationsInput | string;
    payes?: Prisma.StringFieldUpdateOperationsInput | string;
    date_de_naissance?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lieu_de_naissance?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type etudiantCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nom?: Prisma.SortOrder;
    prenom?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mdp?: Prisma.SortOrder;
    sexe?: Prisma.SortOrder;
    ville?: Prisma.SortOrder;
    payes?: Prisma.SortOrder;
    date_de_naissance?: Prisma.SortOrder;
    lieu_de_naissance?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type etudiantAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type etudiantMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nom?: Prisma.SortOrder;
    prenom?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mdp?: Prisma.SortOrder;
    sexe?: Prisma.SortOrder;
    ville?: Prisma.SortOrder;
    payes?: Prisma.SortOrder;
    date_de_naissance?: Prisma.SortOrder;
    lieu_de_naissance?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type etudiantMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nom?: Prisma.SortOrder;
    prenom?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mdp?: Prisma.SortOrder;
    sexe?: Prisma.SortOrder;
    ville?: Prisma.SortOrder;
    payes?: Prisma.SortOrder;
    date_de_naissance?: Prisma.SortOrder;
    lieu_de_naissance?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type etudiantSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type etudiantSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nom?: boolean;
    prenom?: boolean;
    email?: boolean;
    mdp?: boolean;
    sexe?: boolean;
    ville?: boolean;
    payes?: boolean;
    date_de_naissance?: boolean;
    lieu_de_naissance?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["etudiant"]>;
export type etudiantSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nom?: boolean;
    prenom?: boolean;
    email?: boolean;
    mdp?: boolean;
    sexe?: boolean;
    ville?: boolean;
    payes?: boolean;
    date_de_naissance?: boolean;
    lieu_de_naissance?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["etudiant"]>;
export type etudiantSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nom?: boolean;
    prenom?: boolean;
    email?: boolean;
    mdp?: boolean;
    sexe?: boolean;
    ville?: boolean;
    payes?: boolean;
    date_de_naissance?: boolean;
    lieu_de_naissance?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["etudiant"]>;
export type etudiantSelectScalar = {
    id?: boolean;
    nom?: boolean;
    prenom?: boolean;
    email?: boolean;
    mdp?: boolean;
    sexe?: boolean;
    ville?: boolean;
    payes?: boolean;
    date_de_naissance?: boolean;
    lieu_de_naissance?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type etudiantOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nom" | "prenom" | "email" | "mdp" | "sexe" | "ville" | "payes" | "date_de_naissance" | "lieu_de_naissance" | "createdAt" | "updatedAt", ExtArgs["result"]["etudiant"]>;
export type $etudiantPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "etudiant";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nom: string;
        prenom: string;
        email: string;
        mdp: string;
        sexe: string;
        ville: string;
        payes: string;
        date_de_naissance: Date;
        lieu_de_naissance: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["etudiant"]>;
    composites: {};
};
export type etudiantGetPayload<S extends boolean | null | undefined | etudiantDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$etudiantPayload, S>;
export type etudiantCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<etudiantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EtudiantCountAggregateInputType | true;
};
export interface etudiantDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['etudiant'];
        meta: {
            name: 'etudiant';
        };
    };
    /**
     * Find zero or one Etudiant that matches the filter.
     * @param {etudiantFindUniqueArgs} args - Arguments to find a Etudiant
     * @example
     * // Get one Etudiant
     * const etudiant = await prisma.etudiant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends etudiantFindUniqueArgs>(args: Prisma.SelectSubset<T, etudiantFindUniqueArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Etudiant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {etudiantFindUniqueOrThrowArgs} args - Arguments to find a Etudiant
     * @example
     * // Get one Etudiant
     * const etudiant = await prisma.etudiant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends etudiantFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, etudiantFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Etudiant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {etudiantFindFirstArgs} args - Arguments to find a Etudiant
     * @example
     * // Get one Etudiant
     * const etudiant = await prisma.etudiant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends etudiantFindFirstArgs>(args?: Prisma.SelectSubset<T, etudiantFindFirstArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Etudiant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {etudiantFindFirstOrThrowArgs} args - Arguments to find a Etudiant
     * @example
     * // Get one Etudiant
     * const etudiant = await prisma.etudiant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends etudiantFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, etudiantFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Etudiants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {etudiantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Etudiants
     * const etudiants = await prisma.etudiant.findMany()
     *
     * // Get first 10 Etudiants
     * const etudiants = await prisma.etudiant.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const etudiantWithIdOnly = await prisma.etudiant.findMany({ select: { id: true } })
     *
     */
    findMany<T extends etudiantFindManyArgs>(args?: Prisma.SelectSubset<T, etudiantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Etudiant.
     * @param {etudiantCreateArgs} args - Arguments to create a Etudiant.
     * @example
     * // Create one Etudiant
     * const Etudiant = await prisma.etudiant.create({
     *   data: {
     *     // ... data to create a Etudiant
     *   }
     * })
     *
     */
    create<T extends etudiantCreateArgs>(args: Prisma.SelectSubset<T, etudiantCreateArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Etudiants.
     * @param {etudiantCreateManyArgs} args - Arguments to create many Etudiants.
     * @example
     * // Create many Etudiants
     * const etudiant = await prisma.etudiant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends etudiantCreateManyArgs>(args?: Prisma.SelectSubset<T, etudiantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Etudiants and returns the data saved in the database.
     * @param {etudiantCreateManyAndReturnArgs} args - Arguments to create many Etudiants.
     * @example
     * // Create many Etudiants
     * const etudiant = await prisma.etudiant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Etudiants and only return the `id`
     * const etudiantWithIdOnly = await prisma.etudiant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends etudiantCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, etudiantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Etudiant.
     * @param {etudiantDeleteArgs} args - Arguments to delete one Etudiant.
     * @example
     * // Delete one Etudiant
     * const Etudiant = await prisma.etudiant.delete({
     *   where: {
     *     // ... filter to delete one Etudiant
     *   }
     * })
     *
     */
    delete<T extends etudiantDeleteArgs>(args: Prisma.SelectSubset<T, etudiantDeleteArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Etudiant.
     * @param {etudiantUpdateArgs} args - Arguments to update one Etudiant.
     * @example
     * // Update one Etudiant
     * const etudiant = await prisma.etudiant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends etudiantUpdateArgs>(args: Prisma.SelectSubset<T, etudiantUpdateArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Etudiants.
     * @param {etudiantDeleteManyArgs} args - Arguments to filter Etudiants to delete.
     * @example
     * // Delete a few Etudiants
     * const { count } = await prisma.etudiant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends etudiantDeleteManyArgs>(args?: Prisma.SelectSubset<T, etudiantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Etudiants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {etudiantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Etudiants
     * const etudiant = await prisma.etudiant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends etudiantUpdateManyArgs>(args: Prisma.SelectSubset<T, etudiantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Etudiants and returns the data updated in the database.
     * @param {etudiantUpdateManyAndReturnArgs} args - Arguments to update many Etudiants.
     * @example
     * // Update many Etudiants
     * const etudiant = await prisma.etudiant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Etudiants and only return the `id`
     * const etudiantWithIdOnly = await prisma.etudiant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends etudiantUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, etudiantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Etudiant.
     * @param {etudiantUpsertArgs} args - Arguments to update or create a Etudiant.
     * @example
     * // Update or create a Etudiant
     * const etudiant = await prisma.etudiant.upsert({
     *   create: {
     *     // ... data to create a Etudiant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Etudiant we want to update
     *   }
     * })
     */
    upsert<T extends etudiantUpsertArgs>(args: Prisma.SelectSubset<T, etudiantUpsertArgs<ExtArgs>>): Prisma.Prisma__etudiantClient<runtime.Types.Result.GetResult<Prisma.$etudiantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Etudiants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {etudiantCountArgs} args - Arguments to filter Etudiants to count.
     * @example
     * // Count the number of Etudiants
     * const count = await prisma.etudiant.count({
     *   where: {
     *     // ... the filter for the Etudiants we want to count
     *   }
     * })
    **/
    count<T extends etudiantCountArgs>(args?: Prisma.Subset<T, etudiantCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EtudiantCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Etudiant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtudiantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EtudiantAggregateArgs>(args: Prisma.Subset<T, EtudiantAggregateArgs>): Prisma.PrismaPromise<GetEtudiantAggregateType<T>>;
    /**
     * Group by Etudiant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {etudiantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends etudiantGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: etudiantGroupByArgs['orderBy'];
    } : {
        orderBy?: etudiantGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, etudiantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEtudiantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the etudiant model
     */
    readonly fields: etudiantFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for etudiant.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__etudiantClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the etudiant model
 */
export interface etudiantFieldRefs {
    readonly id: Prisma.FieldRef<"etudiant", 'Int'>;
    readonly nom: Prisma.FieldRef<"etudiant", 'String'>;
    readonly prenom: Prisma.FieldRef<"etudiant", 'String'>;
    readonly email: Prisma.FieldRef<"etudiant", 'String'>;
    readonly mdp: Prisma.FieldRef<"etudiant", 'String'>;
    readonly sexe: Prisma.FieldRef<"etudiant", 'String'>;
    readonly ville: Prisma.FieldRef<"etudiant", 'String'>;
    readonly payes: Prisma.FieldRef<"etudiant", 'String'>;
    readonly date_de_naissance: Prisma.FieldRef<"etudiant", 'DateTime'>;
    readonly lieu_de_naissance: Prisma.FieldRef<"etudiant", 'String'>;
    readonly createdAt: Prisma.FieldRef<"etudiant", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"etudiant", 'DateTime'>;
}
/**
 * etudiant findUnique
 */
export type etudiantFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * Filter, which etudiant to fetch.
     */
    where: Prisma.etudiantWhereUniqueInput;
};
/**
 * etudiant findUniqueOrThrow
 */
export type etudiantFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * Filter, which etudiant to fetch.
     */
    where: Prisma.etudiantWhereUniqueInput;
};
/**
 * etudiant findFirst
 */
export type etudiantFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * Filter, which etudiant to fetch.
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of etudiants to fetch.
     */
    orderBy?: Prisma.etudiantOrderByWithRelationInput | Prisma.etudiantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for etudiants.
     */
    cursor?: Prisma.etudiantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` etudiants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` etudiants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of etudiants.
     */
    distinct?: Prisma.EtudiantScalarFieldEnum | Prisma.EtudiantScalarFieldEnum[];
};
/**
 * etudiant findFirstOrThrow
 */
export type etudiantFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * Filter, which etudiant to fetch.
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of etudiants to fetch.
     */
    orderBy?: Prisma.etudiantOrderByWithRelationInput | Prisma.etudiantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for etudiants.
     */
    cursor?: Prisma.etudiantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` etudiants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` etudiants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of etudiants.
     */
    distinct?: Prisma.EtudiantScalarFieldEnum | Prisma.EtudiantScalarFieldEnum[];
};
/**
 * etudiant findMany
 */
export type etudiantFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * Filter, which etudiants to fetch.
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of etudiants to fetch.
     */
    orderBy?: Prisma.etudiantOrderByWithRelationInput | Prisma.etudiantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing etudiants.
     */
    cursor?: Prisma.etudiantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` etudiants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` etudiants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of etudiants.
     */
    distinct?: Prisma.EtudiantScalarFieldEnum | Prisma.EtudiantScalarFieldEnum[];
};
/**
 * etudiant create
 */
export type etudiantCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * The data needed to create a etudiant.
     */
    data: Prisma.XOR<Prisma.etudiantCreateInput, Prisma.etudiantUncheckedCreateInput>;
};
/**
 * etudiant createMany
 */
export type etudiantCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many etudiants.
     */
    data: Prisma.etudiantCreateManyInput | Prisma.etudiantCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * etudiant createManyAndReturn
 */
export type etudiantCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * The data used to create many etudiants.
     */
    data: Prisma.etudiantCreateManyInput | Prisma.etudiantCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * etudiant update
 */
export type etudiantUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * The data needed to update a etudiant.
     */
    data: Prisma.XOR<Prisma.etudiantUpdateInput, Prisma.etudiantUncheckedUpdateInput>;
    /**
     * Choose, which etudiant to update.
     */
    where: Prisma.etudiantWhereUniqueInput;
};
/**
 * etudiant updateMany
 */
export type etudiantUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update etudiants.
     */
    data: Prisma.XOR<Prisma.etudiantUpdateManyMutationInput, Prisma.etudiantUncheckedUpdateManyInput>;
    /**
     * Filter which etudiants to update
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * Limit how many etudiants to update.
     */
    limit?: number;
};
/**
 * etudiant updateManyAndReturn
 */
export type etudiantUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * The data used to update etudiants.
     */
    data: Prisma.XOR<Prisma.etudiantUpdateManyMutationInput, Prisma.etudiantUncheckedUpdateManyInput>;
    /**
     * Filter which etudiants to update
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * Limit how many etudiants to update.
     */
    limit?: number;
};
/**
 * etudiant upsert
 */
export type etudiantUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * The filter to search for the etudiant to update in case it exists.
     */
    where: Prisma.etudiantWhereUniqueInput;
    /**
     * In case the etudiant found by the `where` argument doesn't exist, create a new etudiant with this data.
     */
    create: Prisma.XOR<Prisma.etudiantCreateInput, Prisma.etudiantUncheckedCreateInput>;
    /**
     * In case the etudiant was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.etudiantUpdateInput, Prisma.etudiantUncheckedUpdateInput>;
};
/**
 * etudiant delete
 */
export type etudiantDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
    /**
     * Filter which etudiant to delete.
     */
    where: Prisma.etudiantWhereUniqueInput;
};
/**
 * etudiant deleteMany
 */
export type etudiantDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which etudiants to delete
     */
    where?: Prisma.etudiantWhereInput;
    /**
     * Limit how many etudiants to delete.
     */
    limit?: number;
};
/**
 * etudiant without action
 */
export type etudiantDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the etudiant
     */
    select?: Prisma.etudiantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the etudiant
     */
    omit?: Prisma.etudiantOmit<ExtArgs> | null;
};
//# sourceMappingURL=etudiant.d.ts.map