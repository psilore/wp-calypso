import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import type { Plan } from '@automattic/calypso-products';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { AppState } from 'calypso/types';

import './style.scss';

interface HeaderProps {
	paidDomainName?: string;
}

interface JetpackAppPlansProps {
	paidDomainName?: string;
	originalUrl: string;
}

const Header: React.FC< HeaderProps > = ( { paidDomainName } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-app__plans-header">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Choose the perfect plan' ) }
				align="center"
			/>
			{ paidDomainName ? (
				<>
					<p>
						{ translate(
							'With your annual plan, you’ll get %(domainName)s {{strong}}free for the first year{{/strong}}.',
							{
								args: {
									domainName: paidDomainName,
								},
								components: { strong: <strong /> },
							}
						) }
					</p>
					<p>
						{ translate(
							'You’ll also unlock advanced features that make it easy to build and grow your site.'
						) }
					</p>
				</>
			) : (
				<p>{ translate( 'See and compare the features available on each WordPress.com plan.' ) }</p>
			) }
		</div>
	);
};

const JetpackAppPlans: React.FC< JetpackAppPlansProps > = ( { paidDomainName, originalUrl } ) => {
	const planSlug = useSelector( ( state: AppState ) =>
		getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 )
	) as string | null;
	const plansLoaded = Boolean( planSlug );

	const onUpgradeClick = ( cartItems?: MinimalRequestCartProduct[] | null | undefined ) => {
		const productSlug = getPlanCartItem( cartItems )?.product_slug;

		type PlansParameters = { plan_id?: number; plan_slug: string };
		let args: PlansParameters;

		if ( ! productSlug ) {
			args = { plan_slug: PLAN_FREE };
		} else {
			const plan = getPlan( productSlug ) as Plan;
			args = { plan_id: plan.getProductId(), plan_slug: productSlug };
		}

		window.location.href = addQueryArgs( originalUrl, args );
	};

	return (
		<Main className="jetpack-app__plans">
			<QueryPlans />
			{ plansLoaded ? (
				<>
					<Header paidDomainName={ paidDomainName } />
					<PlansFeaturesMain
						paidDomainName={ paidDomainName }
						intent="plans-jetpack-app-site-creation"
						isInSignup
						intervalType="yearly"
						onUpgradeClick={ onUpgradeClick }
						plansWithScroll={ false }
						hidePlanTypeSelector
						hidePlansFeatureComparison
					/>
				</>
			) : (
				<div className="jetpack-app__plans-loading">
					<LoadingEllipsis />
				</div>
			) }
		</Main>
	);
};

export default JetpackAppPlans;